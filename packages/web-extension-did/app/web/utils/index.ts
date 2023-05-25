import {
  ENVIRONMENT_TYPE_POPUP,
  ENVIRONMENT_TYPE_PROMPT,
  // ENVIRONMENT_TYPE_FULLSCREEN,
  ENVIRONMENT_TYPE_SERVICE_WORKER,
} from 'constants/envType';
import moment from 'moment';
import { apis } from './BrowserApis';

export const omitString = (input: string, start = 10, end = 10) => {
  if (!input) return '';
  return `${input.slice(0, start)}...${input.slice(-end)}`;
};

export const formatToAddress = (address: string) => {
  if (address.includes('_')) return address.split('_')[1];
  return address;
};

export const dateFormat = (ipt?: moment.MomentInput) => {
  return moment(ipt).format('MMM D , h:mm a').replace(',', 'at');
};

export const dateFormatTransTo13 = (ipt?: moment.MomentInput) => {
  let time = String(ipt);
  while (time.length < 13) {
    time = time + '0';
  }
  return moment(Number(time)).format('MMM D , h:mm a').replace(',', 'at');
};

/**
 * Returns an Error if extension.runtime.lastError is present
 * this is a workaround for the non-standard error object that's used
 */
export const checkForError = (): void | Error => {
  const { lastError } = apis.runtime;
  if (!lastError) return undefined;
  if (lastError.message) return new Error(lastError.message);
};

export const getEnvironmentType = (url: string) => {
  const parsedUrl = new URL(url);
  // from popup page
  if (parsedUrl.pathname === '/popup.html') {
    return ENVIRONMENT_TYPE_POPUP;
    // } else if (['/home.html'].includes(parsedUrl.pathname)) {
    //   return ENVIRONMENT_TYPE_FULLSCREEN;
    // from prompt page
  } else if (parsedUrl.pathname === '/prompt.html') {
    return ENVIRONMENT_TYPE_PROMPT;
  }
  // from  content js
  return ENVIRONMENT_TYPE_SERVICE_WORKER;
};
