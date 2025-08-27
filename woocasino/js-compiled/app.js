/**
 * Casino AngularJS Application (TypeScript)
 * Handles payment forms, game interface, and user interactions
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "angular", "angular-lazy-img"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LPConfig = exports.app = void 0;
    var angular = __importStar(require("angular"));
    require("angular-lazy-img");
    // Global variables with types
    var classesToLaunchReg = [
        'button-hero', 'button-reg', 'games__offer__text',
        'button-register', 'game__box', 'jackpot__container',
        'games__offer__text', 'more_info_dialog'
    ];
    var classesToLaunchLog = ['button-login'];
    var gameElements = document.getElementsByClassName('game-list');
    var preloader = "<div class='loading'><div class='loader'></div></div>";
    window.vulcanNamespace = {};
    var xhr = '';
    // Initialize AngularJS application with TypeScript
    var app = angular.module('app', ['angularLazyImg']);
    exports.app = app;
    // Lazy load images when window loads
    window.addEventListener('load', function () {
        // Image lazy loading initialization can go here
    });
    // Payment form submission handler with TypeScript
    $(document).on('submit', 'form.payment-form', function (e) {
        e.preventDefault();
        var $form = $(this);
        var $type = $form.attr('method') || 'POST';
        var $action = $form.attr('action') || '';
        var $data = $form.serialize();
        var $answer = $form.data('answer');
        $.ajax({
            type: $type,
            url: $action,
            data: $data,
            dataType: 'json',
            beforeSend: function () {
                $form.find('.pay-tooltip__note').hide();
                $form.closest('.modal,.popup').append(preloader);
            },
            success: function (data) {
                $('.loading').remove();
                if (data.isFreekassa) {
                    if (data.status) {
                        window.location.href = data.freekassaUrl || '';
                    }
                    else {
                        $form.submit();
                    }
                    return;
                }
                if (data.result !== 'ok') {
                    if (typeof data.message === 'object') {
                        $form.find('.pay-tooltip__note .error__info').html('');
                        $.each(data.message, function (key, value) {
                            $form.find('.pay-tooltip__note .error__info').append(value + "<br/>");
                        });
                    }
                    else {
                        $form.find('.pay-tooltip__note .error__info').html(data.message);
                    }
                    $form.find('.pay-tooltip__note').show();
                }
                else {
                    if (data.form !== undefined) {
                        $('body').append(data.form);
                        $('#' + data.form_id).submit();
                    }
                    else {
                        if ($answer !== undefined) {
                            $('.modal,.popup').hide();
                            $($answer).show();
                        }
                        else {
                            window.location.reload();
                        }
                    }
                }
            },
            error: function (xhr, status, error) {
                $('.loading').remove();
                console.error('Payment form error:', { status: status, error: error });
                $form.find('.pay-tooltip__note .error__info').html('An error occurred. Please try again.');
                $form.find('.pay-tooltip__note').show();
            }
        });
    });
    // Helper function to attach triggers with proper typing
    var attachTriggers = function (classNames, triggerClass) {
        for (var i = 0; i < classNames.length; i++) {
            var elements = document.getElementsByClassName(classNames[i]);
            for (var j = 0; j < elements.length; j++) {
                var element = elements[j];
                element.classList.add(triggerClass);
                element.style.cursor = "pointer";
            }
        }
    };
    // Attach login/register triggers
    attachTriggers(classesToLaunchReg, "sign__up");
    attachTriggers(classesToLaunchLog, "sign__in");
    // Landing Page Configuration helper class
    var LPConfig = /** @class */ (function () {
        function LPConfig() {
        }
        LPConfig.prototype.heroOptions = function (paramOfferPosition, params) {
            var h1Element = document.querySelector('.games__offer__text h1');
            var h2Element = document.querySelector('.games__offer__text h2');
            if (h1Element && params[0]) {
                h1Element.style.color = params[0];
            }
            if (h2Element && params[1]) {
                h2Element.style.color = params[1];
            }
            // Additional positioning logic can be added here
            // switch (paramOfferPosition) {
            //     case 'left':
            //         // Add left positioning logic
            //         break;
            //     case 'right':
            //         // Add right positioning logic
            //         break;
            //     default:
            //         // Default positioning
            // }
        };
        return LPConfig;
    }());
    exports.LPConfig = LPConfig;
    // Make LPConfig available globally
    window.LPConfig = new LPConfig();
});
//# sourceMappingURL=app.js.map