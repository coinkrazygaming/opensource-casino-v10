/**
 * Casino AngularJS Application (TypeScript)
 * Handles payment forms, game interface, and user interactions
 */

import * as angular from 'angular';
import 'angular-lazy-img';

// Type definitions for casino-specific interfaces
interface PaymentFormData {
    result: string;
    message: string | Record<string, string>;
    form?: string;
    form_id?: string;
    isFreekassa?: boolean;
    status?: boolean;
    freekassaUrl?: string;
}

interface VulcanNamespace {
    [key: string]: any;
}

interface LPConfigOptions {
    heroOptions(paramOfferPosition: string, params: string[]): void;
}

// Global variables with types
const classesToLaunchReg: string[] = [
    'button-hero', 'button-reg', 'games__offer__text', 
    'button-register', 'game__box', 'jackpot__container', 
    'games__offer__text', 'more_info_dialog'
];

const classesToLaunchLog: string[] = ['button-login'];

const gameElements: HTMLCollectionOf<Element> = document.getElementsByClassName('game-list');
const preloader: string = "<div class='loading'><div class='loader'></div></div>";

// Extend window interface for casino namespace
declare global {
    interface Window {
        vulcanNamespace: VulcanNamespace;
        LPConfig: LPConfigOptions;
    }
}

window.vulcanNamespace = {};

let xhr: XMLHttpRequest | string = '';

// Initialize AngularJS application with TypeScript
const app: angular.IModule = angular.module('app', ['angularLazyImg']);

// Lazy load images when window loads
window.addEventListener('load', (): void => {
    // Image lazy loading initialization can go here
});

// Payment form submission handler with TypeScript
$(document).on('submit', 'form.payment-form', function(e: JQuery.TriggeredEvent): void {
    e.preventDefault();
    
    const $form = $(this);
    const $type = $form.attr('method') || 'POST';
    const $action = $form.attr('action') || '';
    const $data = $form.serialize();
    const $answer = $form.data('answer');
    
    $.ajax({
        type: $type,
        url: $action,
        data: $data,
        dataType: 'json',
        beforeSend: (): void => {
            $form.find('.pay-tooltip__note').hide();
            $form.closest('.modal,.popup').append(preloader);
        },
        success: (data: PaymentFormData): void => {
            $('.loading').remove();

            if (data.isFreekassa) {
                if (data.status) {
                    window.location.href = data.freekassaUrl || '';
                } else {
                    $form.submit();
                }
                return;
            }

            if (data.result !== 'ok') {
                if (typeof data.message === 'object') {
                    $form.find('.pay-tooltip__note .error__info').html('');
                    $.each(data.message, (key: string, value: string): void => {
                        $form.find('.pay-tooltip__note .error__info').append(value + "<br/>");
                    });
                } else {
                    $form.find('.pay-tooltip__note .error__info').html(data.message);
                }
                $form.find('.pay-tooltip__note').show();
            } else {
                if (data.form !== undefined) {
                    $('body').append(data.form);
                    $('#' + data.form_id).submit();
                } else {
                    if ($answer !== undefined) {
                        $('.modal,.popup').hide();
                        $($answer).show();
                    } else {
                        window.location.reload();
                    }
                }
            }
        },
        error: (xhr: JQuery.jqXHR, status: string, error: string): void => {
            $('.loading').remove();
            console.error('Payment form error:', { status, error });
            $form.find('.pay-tooltip__note .error__info').html('An error occurred. Please try again.');
            $form.find('.pay-tooltip__note').show();
        }
    });
});

// Helper function to attach triggers with proper typing
const attachTriggers = (classNames: string[], triggerClass: string): void => {
    for (let i = 0; i < classNames.length; i++) {
        const elements = document.getElementsByClassName(classNames[i]);
        for (let j = 0; j < elements.length; j++) {
            const element = elements[j] as HTMLElement;
            element.classList.add(triggerClass);
            element.style.cursor = "pointer";
        }
    }
};

// Attach login/register triggers
attachTriggers(classesToLaunchReg, "sign__up");
attachTriggers(classesToLaunchLog, "sign__in");

// Landing Page Configuration helper class
class LPConfig implements LPConfigOptions {
    heroOptions(paramOfferPosition: string, params: string[]): void {
        const h1Element = document.querySelector('.games__offer__text h1') as HTMLElement;
        const h2Element = document.querySelector('.games__offer__text h2') as HTMLElement;
        
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
    }
}

// Make LPConfig available globally
window.LPConfig = new LPConfig();

// Export for potential module usage
export { app, LPConfig, PaymentFormData };
