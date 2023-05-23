import { ResponseCode, IDappRequestResponse, ResponseMessagePreset, ResponseCodeType } from 'dapp/types';

export abstract class ResponseGenerator {
  public static generateNormalResponse = (data: any, code?: ResponseCode): IDappRequestResponse => {
    return {
      code: code ?? ResponseCode.SUCCESS,
      data,
    };
  };
  public static generateErrorResponse = (code: ResponseCode, msg?: string): IDappRequestResponse => {
    return {
      code,
      msg: msg && msg.length > 0 ? msg : ResponseMessagePreset[ResponseCode[code] as ResponseCodeType],
    };
  };
}
