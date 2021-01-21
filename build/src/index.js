"use strict";
// tslint:disable-next-line:no-reference
/// <reference path="./@types/slackbots/index.d.ts" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var yaml = __importStar(require("js-yaml"));
var moment_1 = __importDefault(require("moment"));
var path = __importStar(require("path"));
var web_api_1 = require("@slack/web-api");
var stream_1 = require("stream");
var HelpMessageHandler_1 = __importDefault(require("./handlers/HelpMessageHandler"));
// export public resources
var Logger_1 = require("./Logger");
exports.Logger = Logger_1.default;
var HelpMessageHandler_2 = require("./handlers/HelpMessageHandler");
exports.HelpMessageHandler = HelpMessageHandler_2.default;
var LevelMessageHandler_1 = require("./handlers/LevelMessageHandler");
exports.LevelMessageHandler = LevelMessageHandler_1.default;
var ConsoleLog_1 = require("./ConsoleLog");
exports.ConsoleLog = ConsoleLog_1.default;
// tslint:disable-next-line:no-require-imports no-var-requires
var stripAnsi = require("strip-ansi");
/**
 * Supported log levels.
 *
 * Match the standard options provided by console.
 */
var LogLevel;
(function (LogLevel) {
    LogLevel["TRACE"] = "TRACE";
    LogLevel["DEBUG"] = "DEBUG";
    LogLevel["INFO"] = "INFO";
    LogLevel["WARN"] = "WARN";
    LogLevel["ERROR"] = "ERROR";
    LogLevel["FATAL"] = "FATAL";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
exports.levelNameMap = {
    10: LogLevel.TRACE,
    20: LogLevel.DEBUG,
    30: LogLevel.INFO,
    40: LogLevel.WARN,
    50: LogLevel.ERROR,
    60: LogLevel.FATAL,
};
exports.levelColorMap = (_a = {},
    _a[LogLevel.TRACE] = "#EEEEEE",
    _a[LogLevel.DEBUG] = "#666666",
    _a[LogLevel.INFO] = "#2B72B5",
    _a[LogLevel.WARN] = "#EDBC13",
    _a[LogLevel.ERROR] = "#DE3B43",
    _a[LogLevel.FATAL] = "#DE3B43",
    _a);
// tslint:disable-next-line:max-classes-per-file
var SlackLogger = /** @class */ (function (_super) {
    __extends(SlackLogger, _super);
    // private channels: SlackBotChannel[] | undefined;
    function SlackLogger(options) {
        var _this = _super.call(this, {
            objectMode: true,
        }) || this;
        _this.objectMode = true;
        _this.isOpen = false;
        _this.messageHandlers = [];
        // build options
        _this.options = __assign({ version: "", name: "Slack Logger", channel: "general", iconUrl: "https://image.ibb.co/iOSThT/log_local.png", basePath: path.join(__dirname, "..", ".."), levelIconUrlMap: {
                TRACE: "https://image.ibb.co/bx33bd/log_trace.png",
                DEBUG: "https://image.ibb.co/i64n2J/log_debug.png",
                INFO: "https://image.ibb.co/muqycJ/log_info.png",
                WARN: "https://image.ibb.co/eZsJ9y/log_warn.png",
                ERROR: "https://image.ibb.co/f06Obd/log_error.png",
                FATAL: "https://image.ibb.co/hyAibd/log_fatal.png",
            }, as_user: false }, options);
        // slack logger is enabled if a token was provided
        _this.isEnabled = typeof _this.options.token === "string" && _this.options.token.length > 0;
        // don't attempt to create the bot if no token is provided
        if (!_this.isEnabled) {
            return _this;
        }
        // create slack-bot
        _this.bot = new web_api_1.WebClient(_this.options.token);
        // listen for open event
        // this.bot.on('open', async () => {
        _this.isOpen = true;
        // give up if bot is not available
        if (!_this.bot) {
            return _this;
        }
        // fetch list of channels and groups
        // const { channels } = await this.bot.getChannels();
        // const { groups } = await this.bot.getGroups();
        // this.bot.channels.list().then()
        // save list of channels including groups
        // this.channels = [...channels, ...groups];
        // });
        // listen for close event
        // this.bot.on("close", () => {
        //   this.isOpen = false;
        // });
        // register built-in message handlers
        _this.addMessageHandler(new HelpMessageHandler_1.default());
        return _this;
        // listen for incoming messages
        // this.bot.on("message", async (message) => this.onMessage(message));
    }
    Object.defineProperty(SlackLogger.prototype, "isConnected", {
        get: function () {
            return this.isOpen;
        },
        enumerable: true,
        configurable: true
    });
    SlackLogger.prototype.addMessageHandler = function (messageHandler) {
        this.messageHandlers.push(messageHandler);
    };
    SlackLogger.prototype.getMessageHandlerByName = function (name) {
        return this.messageHandlers.find(function (item) { return item.getName() === name; });
    };
    SlackLogger.prototype.getMessageHandlers = function () {
        return this.messageHandlers;
    };
    // public getChannelById(id: string): SlackBotChannel | undefined {
    //   if (!this.channels) {
    //     return undefined;
    //   }
    //   return this.channels.find((channel) => channel.id === id);
    // }
    // public getChannelByName(name: string): SlackBotChannel | undefined {
    //   if (!this.channels) {
    //     return undefined;
    //   }
    //   return this.channels.find((channel) => channel.name === name);
    // }
    SlackLogger.prototype.sendMessage = function (userInfo) {
        // just ignore messages if no bot was created
        if (!this.bot) {
            return;
        }
        var info = __assign({ level: LogLevel.INFO, userData: {}, component: "unknown component" }, userInfo);
        // resolve message details
        var messageIconUrl = this.options.levelIconUrlMap[info.level]
            ? this.options.levelIconUrlMap[info.level]
            : this.options.levelIconUrlMap[LogLevel.INFO];
        var color = exports.levelColorMap[info.level] ? exports.levelColorMap[info.level] : exports.levelColorMap[LogLevel.INFO];
        var rawSource = info.src ? info.src.file + ":" + (info.src.line ? ":" + info.src.line : "") : undefined;
        var formattedSource = rawSource ? this.formatSource(this.options.basePath, rawSource) : undefined;
        // add date to footer
        var footer = this.getDateTime();
        // add source to footer if exists
        if (formattedSource) {
            footer += " \u2022 " + formattedSource;
        }
        // use either version provided in the method call or in the options
        var version = info.version || this.options.version;
        // add version if set
        if (version.length > 0) {
            footer += " \u2022 v" + version;
        }
        // add name if set
        if (this.options.name) {
            footer += " \u2022 v" + this.options.name;
        }
        // add hostname if set
        if (typeof info.hostname === "string" && info.hostname.length > 0) {
            footer += " \u2022 " + info.hostname;
        }
        // convert user data to YAML
        var userDataYaml = Object.keys(info.userData).length > 0
            ? yaml.safeDump(info.userData, {
                skipInvalid: true,
                noRefs: true,
                noCompatMode: true,
            })
            : "";
        // set text to formatted yaml
        var text = userDataYaml.length > 0 ? "```" + userDataYaml + "```" : "";
        // add stack trace if available
        if (info.error && info.error.stack) {
            text += "\n" + info.error.stack
                .split("\n")
                .map(function (line) { return "> " + line; })
                .join("\n");
        }
        // post the message
        this.post("", {
            channel: this.options.channel,
            text: info.text,
            attachments: [
                {
                    fallback: info.text,
                    color: color,
                    author_name: info.component ? info.component : undefined,
                    title: info.text,
                    text: text,
                    // image_url: "http://my-website.com/path/to/image.jpg",
                    // thumb_url: "http://example.com/path/to/thumb.png",
                    footer: footer,
                    footer_icon: messageIconUrl,
                },
            ],
        });
    };
    /**
     * This stream method is called by Bunyan.
     *
     * @param data Data to log
     */
    SlackLogger.prototype.write = function (data) {
        // just ignore messages if no bot was created
        if (!this.bot) {
            return true;
        }
        // extract known data and the rest as user data
        var _a = data, name = _a.name, component = _a.component, lvl = _a.level, msg = _a.msg, msg2 = _a.message, time = _a.time, hostname = _a.hostname, pid = _a.pid, v = _a.v, version = _a.version, err = _a.err, err2 = _a.error, filename = _a.filename, src = _a.src, userData = __rest(_a, ["name", "component", "level", "msg", "message", "time", "hostname", "pid", "v", "version", "err", "error", "filename", "src"]);
        // resolve error
        var error = err || err2;
        var message = msg || msg2;
        var text = stripAnsi(message || "");
        // ignore if the message and error are missing
        if (text.length === 0 && error === undefined) {
            return false;
        }
        // resolve error level
        var level = LogLevel.INFO;
        // winston gives string levels such as info, warn, bunyan gives numbers sucks as 10, 20
        if (typeof lvl === "string") {
            if (Object.keys(LogLevel).indexOf(lvl.toUpperCase()) !== -1) {
                level = lvl.toUpperCase();
            }
        }
        else if (typeof lvl === "number") {
            var mappedLevel = exports.levelNameMap[lvl];
            level = mappedLevel ? mappedLevel : LogLevel.INFO;
        }
        // send the message
        this.sendMessage({
            component: component || name,
            hostname: hostname,
            src: src !== undefined ? src : filename !== undefined ? { file: filename, line: undefined } : undefined,
            version: this.options.version,
            error: error,
            text: text,
            level: level,
            userData: userData,
        });
        return true;
    };
    SlackLogger.prototype.end = function () {
        this.emit("end");
        return true;
    };
    SlackLogger.prototype.post = function (message, options) {
        if (options === void 0) { options = { channel: this.options.channel, text: '' }; }
        // just ignore post requests if no bot was created
        if (!this.bot) {
            return;
        }
        // attempt to post the message
        try {
            this.bot.chat.postMessage(__assign({ username: this.options.name, icon_url: this.options.iconUrl }, options));
        }
        catch (error) {
            console.warn("posting \"" + message + "\" to slack failed (" + error.message + ")");
        }
    };
    // public async onMessage(message: SlackBotMessage) {
    //   // only handle normal messages
    //   if (message.type !== "message" || typeof message.text !== "string") {
    //     return;
    //   }
    //   // attempt to get channel info by name
    //   const channel = this.getChannelById(message.channel);
    //   // ignore message if no such channel was found
    //   if (!channel) {
    //     return;
    //   }
    //   // ignore messages from wrong channels
    //   if (channel.name !== this.options.channel) {
    //     return;
    //   }
    //   // split the message into tokens and use the first word as the name of the command
    //   const tokens = message.text.split(" ");
    //   const name = tokens[0];
    //   // attempt to find the message handler
    //   const messageHandler = this.getMessageHandlerByName(name);
    //   // ignore unsupported messages
    //   if (!messageHandler) {
    //     return;
    //   }
    //   // handle supported messages
    //   await messageHandler.handleMessage(message, this);
    // }
    SlackLogger.prototype.formatSource = function (basePath, source) {
        return path.relative(basePath, source).replace(/\\/g, "/");
    };
    SlackLogger.prototype.getDateTime = function () {
        return moment_1.default().format("DD.MM HH:mm:ss");
    };
    return SlackLogger;
}(stream_1.Transform));
exports.default = SlackLogger;
//# sourceMappingURL=index.js.map