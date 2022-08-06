# insomnia-plugin-exec-suite

An Insomnia plugin to run all or conditional requests in a folder. Via plugin, user can `SKIP` a particular request, `WAIT` after a particular request has run or can `STOP` execution at a certain request. It also supports root level and request level `RETRY` options.

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
