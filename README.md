# insomnia-plugin-exec-suite

An Insomnia plugin to run all or conditional requests in a folder. Via plugin, user can `SKIP` a particular request, `STOP` at a particular request or can `STOP` execution at a certain request.

## Usage

1. The Plugin can be used to send all requests in a folder.

![Execute All Requests](./images/ExecuteAllRequests.PNG)

2. Modify Folder run.
We can add some attributes to each request like `WAIT`, `SKIP` and `STOP` inside double back ticks.

![Execute All Requests](./images/Attributes.PNG)

a. `WAIT(10)`
When running all requests in the folder, execution will wait for `10 seconds` if encountered above tag. Number of seconds can be customized by passing different number inside `WAIT` like `WAIT(5)`, `WAIT(20)` etc.

b. `SKIP`
When running all requests in the folder, execution will SKIP this particular request.

c. `STOP`
When running all requests in the folder, execution will stop at the current request.

Please find the screenshot below to see the execution plan of the folder.

![Result of Folder run with attributes](./images/AttributeWithResult.PNG)

Also please see the dialog visible after entire folder is ran.

![Result of Folder run](./images/ResultDialog.PNG)
