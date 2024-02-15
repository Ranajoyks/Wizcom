import axios from "axios";
import SessionHelper from "../Core/SessionHelper";
import { KSResponse } from "../Entity/JInitializeResponse";

export type BaseUrlType = "ERES" | "SignalR"

export default class BaseApi {


    public static readonly BaseUrlEresourceerp = "http://eipl.eresourceerp.com"
    // public static readonly BaseUrlEresourceerp = "http://eiplutm.eresourceerp.com/AzaaleaR"
    public static readonly BaseUrlSignalR = "https://wemessanger.azurewebsites.net/"


    protected static async GetHeaders(type: "GetOrPost" | "Multipart" = "GetOrPost") {
        var sessionId = await SessionHelper.GetSessionId()
        return {
            'Content-Type': type == "GetOrPost" ? 'application/json' : "multipart/form-data",
            Cookie: `ASP.NET_SessionId=${sessionId}`,
        }
    };


    private static async getFinalUrl(DomainUrl: BaseUrlType, relativeUrl: string, IsMultiPart: boolean): Promise<string> {

        //console.log('DomainUrl Type-->', DomainUrl)
        //console.log('Relative URl-->', relativeUrl)
        var value;
        switch (DomainUrl) {
            case "ERES":
                var url = BaseApi.BaseUrlEresourceerp

                var storedUrl = await SessionHelper.GetURL()
                if (storedUrl) {
                    if (!storedUrl.startsWith("http")) {
                        storedUrl = "http://" + storedUrl
                    }
                    url = storedUrl
                }

                if (!url.endsWith("/")) {
                    url = url + "/"
                }
                if (!IsMultiPart) {
                    if (!url.endsWith("api")) {
                        url = url + "api"
                    }
                }
                if (!url.endsWith("/")) {
                    url = url + "/"
                }

                //console.log('BaseURL ERES-->', url)
                value = url + relativeUrl;
                break
            case "SignalR":
                value = BaseApi.BaseUrlSignalR + "api/" + relativeUrl;
                break
            default:
                value = "" as never;
                break
        }

        //console.log("Final Url==>", value)



        return value;
    }

    protected static async Get<T, M>(DomainUrl: BaseUrlType, url: string): Promise<KSResponse<T>> {


        var headers = await this.GetHeaders()
        var url = await BaseApi.getFinalUrl(DomainUrl, url, false)
        console.log("Get url-->", url)
        console.log("Get headers-->", headers)
        var response: KSResponse<T> = { data: undefined, IsKSError: false, ErrorInfo: "" }

        return new Promise((resolve) => {
            axios.get<T>(url, {
                headers: headers,
            })
                .then(res => {
                    //console.log("Get data Resposne-->", JSON.stringify(res.data, null, 2))
                    response.data = res.data
                    resolve(response)
                })
                .catch(err => {
                    console.log("Get error-->", JSON.stringify(err, null, 2))
                    response.IsKSError = true
                    response.ErrorInfo = err?.messager || err?.error
                    resolve(response)
                })
        })
    }

    private static async _PostInternal<T>(DomainUrl: BaseUrlType, url: string, Model: unknown, IsMultiPart: boolean): Promise<KSResponse<T>> {
        var headers = await this.GetHeaders(IsMultiPart ? "Multipart" : "GetOrPost")
        var url = await BaseApi.getFinalUrl(DomainUrl, url, IsMultiPart)
        console.log("Post url-->", url)
        console.log("Post headers-->", headers)

        var response: KSResponse<T> = { data: undefined, IsKSError: false, ErrorInfo: "" }
        return new Promise((resolve) => {
            axios.post<T>(url, Model, {
                headers: headers,
            })
                .then(res => {
                    //console.log("Post data Resposne-->", JSON.stringify(res.data, null, 2))
                    response.data = res.data
                    resolve(response)
                })
                .catch(err => {
                    console.log("Post error-->", JSON.stringify(err, null, 2))
                    response.IsKSError = true
                    response.ErrorInfo = err?.message || err?.error
                    resolve(response)
                })
        })
    }
    private static async _PutInternal<T>(DomainUrl: BaseUrlType, url: string, Model: unknown, IsMultiPart: boolean): Promise<KSResponse<T>> {
        var headers = await this.GetHeaders(IsMultiPart ? "Multipart" : "GetOrPost")
        var url = await BaseApi.getFinalUrl(DomainUrl, url, IsMultiPart)
        console.log("Put url-->", url)
        console.log("Put headers-->", headers)

        var response: KSResponse<T> = { data: undefined, IsKSError: false, ErrorInfo: "" }
        return new Promise((resolve) => {
            axios.put<T>(url, Model, {
                headers: headers,
            })
                .then(res => {
                    //console.log("Post data Resposne-->", JSON.stringify(res.data, null, 2))
                    response.data = res.data
                    resolve(response)
                })
                .catch(err => {
                    console.log("Put error-->", JSON.stringify(err, null, 2))
                    response.IsKSError = true
                    response.ErrorInfo = err?.message || err?.error
                    resolve(response)
                })
        })
    }

    protected static async Post<T>(DomainUrl: BaseUrlType, url: string, Model: unknown): Promise<KSResponse<T>> {
        return this._PostInternal(DomainUrl, url, Model, false)
    }
    protected static async PostFile<T>(DomainUrl: BaseUrlType, url: string, Model: unknown): Promise<KSResponse<T>> {
        return this._PostInternal(DomainUrl, url, Model, true)
    }
    protected static async Put<T>(DomainUrl: BaseUrlType, url: string, Model: unknown): Promise<KSResponse<T>> {
        return this._PutInternal(DomainUrl, url, Model, false)
    }
}