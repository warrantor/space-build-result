const CryptoJS = require('crypto-js');
const node_fetch = require('node-fetch');
import path = require('path');
import * as tl from 'azure-pipelines-task-lib/task';

async function run() {
    try {
        const resource_path = path.join(__dirname, 'task.json');
        tl.debug(`Resource Path: ${resource_path}`);
        tl.setResourcePath(resource_path);

        // Space Settings
        const channel_id = tl.getInput('ChannelId', true);
        const space_uri = tl.getInput('SpaceUri', true);
        const chat_message = tl.getInput('ChatMessage', false);
        const include_badge = tl.getBoolInput('IncludeBadge');

        // Azure DevOps Settings
        const collection_uri = tl.getVariable('system.collectionUri');
        const team_project = tl.getVariable('system.teamProject');
        const build_number = tl.getVariable('build.buildNumber');
        const pipeline_name = tl.getVariable('build.definitionName');

        // Message Settings
        const token = await getToken(space_uri);
        if (token === '') return;

        const job_status = tl.getVariable('agent.jobStatus');

        const job_status_text = job_status === 'Canceled' ? `was ${job_status}` : job_status;
        const build_uri = `${collection_uri}/${team_project}/_build/results?buildId=${build_number}`;
        let message = chat_message || `> #${pipeline_name}\n >[Build ${build_number}](${build_uri}) ${job_status_text}`;

        if (include_badge) {
            const badge_uri = getBadgeUri(pipeline_name, job_status);
            message += `\n ![Build badge](${badge_uri})`;
        }

        const body = {
            channel: channel_id,
            text: message
        };

        const response = await node_fetch(space_uri + '/api/http/chats/messages/send', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            tl.setResult(tl.TaskResult.Failed, response.statusText || 'Send message failed');
            return;
        }

        tl.setResult(tl.TaskResult.Succeeded, `Message has been sent\n${message}`, true);
    } catch (error) {
        tl.setResult(tl.TaskResult.Failed, 'An error occured', true);
    }
}

async function getToken(space_uri: string): Promise<string> {
    tl.debug(`Start getToken() for Space: ${space_uri}`);

    const client_id = tl.getInput('ClientId', true);
    const client_secret = tl.getInput('ClientSecret', true);

    const encryptedToken = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
    tl.debug(`Encrypted Token: ${JSON.stringify(encryptedToken)}`);

    const response = await node_fetch(space_uri + '/oauth/token', {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${encryptedToken}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
    });

    tl.debug(`Token Response: ${JSON.stringify(response)}`);

    if (response.error) {
        tl.debug(`Authentication failed with error: ${response.error} -> ${response.error_description}`);
        tl.setResult(tl.TaskResult.Failed, response.error_description || 'Authentication failed');
        return '';
    }

    const responseBody = await response.json();

    tl.debug(`Token Response Body: ${JSON.stringify(responseBody)}`);
    return responseBody.access_token;
}

function getBadgeUri(pipeline_name: string, job_status: string): string {
    tl.debug(`Start getBadgeUri() for Pipeline: ${pipeline_name}`);

    pipeline_name = pipeline_name.split('-').join(' ');
    let left_side = encodeURI(pipeline_name);
    let badge_uri = `https://img.shields.io/badge/${left_side}-`;

    switch (job_status) {
        case 'Failed':
            badge_uri += 'failed-red';
            break;
        case 'Succeeded':
            badge_uri += 'succeeded-brightgreen';
            break;
        case 'Canceled':
            badge_uri += 'canceled-lightgrey';
            break;
        default:
            badge_uri += 'unknown-orange';
            break;
    }

    tl.debug(`BadgeURI: ${badge_uri}`);

    return badge_uri;
}

run();