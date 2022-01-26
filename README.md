# Eldrow: Wordle in Reverse

## Setup

First you are gonna have to get Rust at [rust-lang.org](https://www.rust-lang.org/).
Then, you will need to have [nodejs](https://nodejs.org/) installed.

For the WebAssembly side of things, you are going to have to get to Rust nightly,
and install the WebAssembly compiler.

```bash
rustup default nightly
rustup target add wasm32-unknown-unknown --toolchain nightly
```

Then, you are going to need [wasm-pack](https://github.com/ashleygwilliams/wasm-pack)

```bash
cargo install wasm-pack
```

Finally, you can compile the WebAssembly module and start a development web server.

```bash
wasm-pack init .
cd web
npm install
npm run serve
```

You can then open the page at [localhost:8080](http://localhost:8080)

## Deploy

Copy the files in `web/dist` and `web/public` into the same directory on your static web server.

## License

MIT

Starter code from: https://github.com/adamisntdead/wasm-starter
