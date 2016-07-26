import { isFunction, isObject, toArray } from 'lodash';
import sendMessage from './messageService';
import constants from '../constants';

/**
 * takes a list of handlers as object and play role of middleware when events occured.
 *
 * @return function middleware to process request.
 */

const receiverHandler = handlers => {
	constants.set('eventManifest', Object.keys(handlers));
	return (request, sender, sendResponse) => {
		const lastError = chrome.runtime.lastError; // NOTE: not sure if this works
		if (lastError) {
			sendResponse({
				type: 'error',
				payload: {
					error: lastError.message,
					stack: lastError
				}
			});
			console.error(lastError.message);
		}
		console.log('[REQUEST]: ', request.type);
		if (handlers.hasOwnProperty(request.type)) {
			if (request.payload) {
				const func = handlers[request.type](request.payload);
				if (func instanceof Promise) {
					func.then(response => {
						if (typeof response !== 'undefined') {
							sendResponse(response);
						}
					}).catch(err => {
						console.error(err);
						if (isObject(err) && {}.hasOwnProperty.call(err, 'statusText')) {
							sendResponse({
								type: 'error',
								payload: {
									error: err.statusText,
									stack: err
								}
							});
						} else {
							sendResponse({
								type: 'error',
								payload: {
									error: err.toString(),
									stack: err.stack
								}
							});
						}
					});
				} else {
					if (typeof func !== 'undefined') {
						sendResponse(func);
					}
				}
			} else {
				const func = handlers[request.type]();
				if (func instanceof Promise) {
					func.then(response => {
						if (typeof response !== 'undefined') {
							sendResponse(response);
						}
					}).catch(err => {
						console.error(err);
						sendResponse({
							type: 'error',
							payload: {
								error: err.toString(),
								stack: err.stack
							}
						});
					});
				} else {
					if (typeof func !== 'undefined') {
						sendResponse(func);
					}
				}
			}
		}
	return true;
	};
};

export default receiverHandler;
