"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var CryptoJS = require('crypto-js');
var node_fetch = require('node-fetch');
var path = require("path");
var tl = require("azure-pipelines-task-lib/task");
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var resource_path, channel_id, space_uri, chat_message, include_badge, collection_uri, team_project, build_number, pipeline_name, token, job_status, job_status_text, build_uri, message, badge_uri, body, response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    resource_path = path.join(__dirname, 'task.json');
                    tl.debug("Resource Path: " + resource_path);
                    tl.setResourcePath(resource_path);
                    channel_id = tl.getInput('ChannelId', true);
                    space_uri = tl.getInput('SpaceUri', true);
                    chat_message = tl.getInput('ChatMessage', false);
                    include_badge = tl.getBoolInput('IncludeBadge');
                    collection_uri = tl.getVariable('system.collectionUri');
                    team_project = tl.getVariable('system.teamProject');
                    build_number = tl.getVariable('build.buildNumber');
                    pipeline_name = tl.getVariable('build.definitionName');
                    return [4 /*yield*/, getToken(space_uri)];
                case 1:
                    token = _a.sent();
                    if (token === '')
                        return [2 /*return*/];
                    job_status = tl.getVariable('agent.jobStatus');
                    job_status_text = job_status === 'Canceled' ? "was " + job_status : job_status;
                    build_uri = collection_uri + "/" + team_project + "/_build/results?buildId=" + build_number;
                    message = chat_message || "> #" + pipeline_name + "\n >[Build " + build_number + "](" + build_uri + ") " + job_status_text;
                    if (include_badge) {
                        badge_uri = getBadgeUri(pipeline_name, job_status);
                        message += "\n ![Build badge](" + badge_uri + ")";
                    }
                    body = {
                        channel: channel_id,
                        text: message
                    };
                    return [4 /*yield*/, node_fetch(space_uri + '/api/http/chats/messages/send', {
                            method: 'POST',
                            headers: {
                                'Authorization': "Bearer " + token,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(body)
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) {
                        tl.setResult(tl.TaskResult.Failed, response.statusText || 'Send message failed');
                        return [2 /*return*/];
                    }
                    tl.setResult(tl.TaskResult.Succeeded, "Message has been sent\n" + message, true);
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    tl.setResult(tl.TaskResult.Failed, 'An error occured', true);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function getToken(space_uri) {
    return __awaiter(this, void 0, void 0, function () {
        var client_id, client_secret, encryptedToken, response, responseBody;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    tl.debug("Start getToken() for Space: " + space_uri);
                    client_id = tl.getInput('ClientId', true);
                    client_secret = tl.getInput('ClientSecret', true);
                    encryptedToken = Buffer.from(client_id + ":" + client_secret).toString('base64');
                    tl.debug("Encrypted Token: " + JSON.stringify(encryptedToken));
                    return [4 /*yield*/, node_fetch(space_uri + '/oauth/token', {
                            method: 'POST',
                            headers: {
                                'Authorization': "Basic " + encryptedToken,
                                'Content-Type': 'application/x-www-form-urlencoded'
                            },
                            body: 'grant_type=client_credentials'
                        })];
                case 1:
                    response = _a.sent();
                    tl.debug("Token Response: " + JSON.stringify(response));
                    if (response.error) {
                        tl.debug("Authentication failed with error: " + response.error + " -> " + response.error_description);
                        tl.setResult(tl.TaskResult.Failed, response.error_description || 'Authentication failed');
                        return [2 /*return*/, ''];
                    }
                    return [4 /*yield*/, response.json()];
                case 2:
                    responseBody = _a.sent();
                    tl.debug("Token Response Body: " + JSON.stringify(responseBody));
                    return [2 /*return*/, responseBody.access_token];
            }
        });
    });
}
function getBadgeUri(pipeline_name, job_status) {
    tl.debug("Start getBadgeUri() for Pipeline: " + pipeline_name);
    pipeline_name = pipeline_name.split('-').join(' ');
    var left_side = encodeURI(pipeline_name);
    var badge_uri = "https://img.shields.io/badge/" + left_side + "-";
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
    tl.debug("BadgeURI: " + badge_uri);
    return badge_uri;
}
run();
