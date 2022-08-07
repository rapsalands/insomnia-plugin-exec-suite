# insomnia-plugin-exec-suite

An Insomnia plugin to run all or conditional requests in a folder. Via plugin, user can `SKIP` a particular request, `WAIT` after a particular request has run or can `STOP` execution at a certain request. It also supports root level and request level `RETRY` options.


## TLDR;
Clicking on `Execute All Requests` folder menu item will execute all requests.
1. `SKIP`
    a. Skips the current/marked request irrespective of being placed as prefix or suffix.
2. `STOP`
    a. Execution flow will stop before (if placed as prefix) or after (if placed as suffix) executing marked request.
3. `WAIT(seconds)`
    a. Will await before (if placed as prefix) or after (if placed as suffix) executing marked request.
    b. Waiting numbers are given in brackets in seconds. For example `` `WAIT(10)` `` means wait for 10 seconds.
4. `RETRY(count)`
    a. Can be placed on folder or request.
    b. During execution, if any request does not return `200` status code, that request will be retried again.
    c. Retry count can be provided inside brackets.
    d. When placed on folder, retry settings are applicable for all requests inside folder. When placed on request, settings will be appicable only for that request and will override folder settings.

## Usage

1. The Plugin can be used to send all requests in a folder.

![Execute All Requests](./images/ExecuteAllRequests.PNG)

2. Modify Folder run.
We can add some attributes to each request like `WAIT`, `SKIP` and `STOP` inside double back ticks (``).

![Execute All Requests](./images/Attributes.PNG)

a. `WAIT(10)`
When running all requests in the folder:
    i. If `WAIT` is present in front of the request name (example would be `` `WAIT(10)` Save Note``.) execution will wait BEFORE running the current request.
    i. If `WAIT` is present in after the request name (example would be `` Save Note `WAIT(10)` ``.) execution will wait AFTER running the current request.

b. `SKIP`
When running all requests in the folder, execution will SKIP this particular request and continue to execute others as usual.

c. `STOP`
When running all requests in the folder:
    i. If `STOP` is present in front of the request name (example would be `` `STOP` Save Note``.) execution will stop at the current request (and current request will not be executed).
    ii. If `STOP` is present in after the request name (example would be ``Save Note `STOP` ``.) execution will stop after executing current request.

d. `RETRY`
`RETRY` option can be defined at the root level (on folder name) and also on the request level (like any other tag).
Request level `RETRY` tag will retry sending the request if the response's `statusCode` is NOT 200.
Number of retries must be defined in brackets like `WAIT` tag. Example would be (``Note-Taking-App `RETRY(3)` ``).
`RETRY` tag can be placed before or after the request name.
If defined on both root level and request level, request level value will be considered and root level value will be ignored for that particular request.


We can use multiple tags separated by comma if needed.

Please find the screenshot below to see the execution plan of the folder.

![Result of Folder run with attributes](./images/AttributeWithResult.PNG)

Also please see the dialog visible after entire folder is ran.

![Result of Folder run](./images/ResultDialog.PNG)
