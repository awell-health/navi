# working with smart apps

I generally use [SMART Launcher](https://launch.smarthealthit.org/?launch_url=https%3A%2F%2Fb3f255dea153.ngrok-free.app%2Fsmart%2Flaunch&launch=WzAsIm1vdGhlci1iYWMwYzRmMyw3YjkxNDZiMy04YjFiLTRjZjktYWYzNi01MzBkOGM0ZmNmMDUiLCI2MGM5ZmU2My1kOWU2LTRlNWUtOGQ1Yy1mOTFiN2ZjNzU0MTkiLCJBVVRPIiwwLDAsMSwiIiwiIiwiIiwiIiwiIiwiIiwiIiwyLDEsIiJd&tab=0&validation=0) and ngrok to test, though i believe you can also clone smart launcher (or maybe a dockerfile?) and work locally if you want.

```bash
pnpm dev:portal # runs the app
ngrok http 3000 # creates the tunnel
```
