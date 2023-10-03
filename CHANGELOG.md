# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.5.1](https://github.com/ecomplus/app-custom-shipping/compare/v1.5.0...v1.5.1) (2023-10-03)


### Bug Fixes

* **calculate-shipping:** prevent error with undefined `rule` when checking `no_cubic_weight` option ([#12](https://github.com/ecomplus/app-custom-shipping/issues/12)) ([8e8bde1](https://github.com/ecomplus/app-custom-shipping/commit/8e8bde14b0796753bac7b0f36fcab3728540fab2))

## [1.5.0](https://github.com/ecomplus/app-custom-shipping/compare/v1.4.0...v1.5.0) (2023-10-03)


### Features

* **calculate-shipping:** add option to consider only physical weight ([#11](https://github.com/ecomplus/app-custom-shipping/issues/11)) ([ed24b01](https://github.com/ecomplus/app-custom-shipping/commit/ed24b01ac571382a1636e0e410de9db1d0d39989))

## [1.4.0](https://github.com/ecomplus/app-custom-shipping/compare/v1.3.6...v1.4.0) (2023-03-08)


### Features

* **calculate-shipping:** free shipping option by product ([#9](https://github.com/ecomplus/app-custom-shipping/issues/9)) ([#10](https://github.com/ecomplus/app-custom-shipping/issues/10)) ([77339db](https://github.com/ecomplus/app-custom-shipping/commit/77339db70e9de76a353d24bd64415beca70bdf12))


### Bug Fixes

* **application:** removing invalid JSON trailing comma ([4c1667c](https://github.com/ecomplus/app-custom-shipping/commit/4c1667c6dd66ceb55eee37efde1e0dffdd4f9d6a))

### [1.3.6](https://github.com/ecomplus/app-custom-shipping/compare/v1.3.5...v1.3.6) (2022-07-05)

### [1.3.5](https://github.com/ecomplus/app-custom-shipping/compare/v1.3.4...v1.3.5) (2022-05-15)


### Bug Fixes

* use phisical weight when cubic (dimensions) lower than 5 ([#7](https://github.com/ecomplus/app-custom-shipping/issues/7)) ([653440c](https://github.com/ecomplus/app-custom-shipping/commit/653440c90953a01399f7289b6607ab4bac585e3f))

### [1.3.4](https://github.com/ecomplus/app-custom-shipping/compare/v1.3.3...v1.3.4) (2021-10-21)


### Bug Fixes

* **deps:** update @ecomplus/application-sdk to v1.15.5 sqlite ([c69d73e](https://github.com/ecomplus/app-custom-shipping/commit/c69d73ed53fca8c5fa7486c93dee34639585c916))

### [1.3.3](https://github.com/ecomplus/app-custom-shipping/compare/v1.3.2...v1.3.3) (2021-08-05)


### Bug Fixes

* **calculate-shipping:** ensure rule specific origin zip is respected ([d0cad39](https://github.com/ecomplus/app-custom-shipping/commit/d0cad39666cdb56d6948d3a22d4534ba52dc37b3))

### [1.3.2](https://github.com/ecomplus/app-custom-shipping/compare/v1.3.1...v1.3.2) (2021-08-05)


### Bug Fixes

* **calculate-shipping:** double check origin zip from shipping rules [[#6](https://github.com/ecomplus/app-custom-shipping/issues/6)] ([c017030](https://github.com/ecomplus/app-custom-shipping/commit/c0170309347953fe2f23b1930911f883541f9dc5))

### [1.3.1](https://github.com/ecomplus/app-custom-shipping/compare/v1.3.0...v1.3.1) (2021-06-16)


### Bug Fixes

* **calculate-shipping:** prevent errors with undefined service by code ([020f082](https://github.com/ecomplus/app-custom-shipping/commit/020f08292f74b64e44a54241830b6e148b4b9047))

## [1.3.0](https://github.com/ecomplus/app-custom-shipping/compare/v1.2.3...v1.3.0) (2021-06-14)


### Features

* **calculate-shipping:** retrieving more fields (zip, label...) from shipping rule ([36ca268](https://github.com/ecomplus/app-custom-shipping/commit/36ca26875238cec7020c9d591e74e45dca78336d))

### [1.2.3](https://github.com/ecomplus/app-custom-shipping/compare/v1.2.2...v1.2.3) (2021-06-08)

### [1.2.2](https://github.com/ecomplus/app-custom-shipping/compare/v1.2.1...v1.2.2) (2021-01-12)


### Bug Fixes

* **calculate-shipping:** fix setting `delivery_time` and `posting_deadline` on shipping lines ([17f30a3](https://github.com/ecomplus/app-custom-shipping/commit/17f30a39649664629787af011cae6b2c802f0279))

### [1.2.1](https://github.com/ecomplus/app-custom-shipping/compare/v1.2.0...v1.2.1) (2020-07-21)


### Bug Fixes

* **calculate-shipping:** undefied total price gives free shipping ([e50e3d6](https://github.com/ecomplus/app-custom-shipping/commit/e50e3d6e4b42e36d70fd5a06ef023263e33aa51b))

## [1.2.0](https://github.com/ecomplus/app-custom-shipping/compare/v1.1.1...v1.2.0) (2020-06-23)


### Features

* **calculate-shipping:** add 'disable_free_shipping_from' rule option ([1558ffa](https://github.com/ecomplus/app-custom-shipping/commit/1558ffaff830f11d6df480fcb54548dc7ab10e14))


### Bug Fixes

* **calculate-shipping:** validate zip for 'free_shipping_from_value' ([ae1a6dc](https://github.com/ecomplus/app-custom-shipping/commit/ae1a6dc6fb67ea5116220f00c9b660fe0d12d1e0))

### [1.1.1](https://github.com/ecomplus/app-custom-shipping/compare/v1.1.0...v1.1.1) (2020-05-14)


### Bug Fixes

* import @ecomplus/application-sdk in place of ecomplus-app-sdk ([035dca8](https://github.com/ecomplus/app-custom-shipping/commit/035dca8a96abf4b0d022bc937ee1faa3e9622fd9))

## [1.1.0](https://github.com/ecomplus/app-custom-shipping/compare/v1.0.0...v1.1.0) (2020-05-14)


### Features

* **calculate-shipping:** handle 'excedent_weight_cost' & 'amount_tax' ([38a943a](https://github.com/ecomplus/app-custom-shipping/commit/38a943ace80b6f206cf7ba726f8f11dd577fd80f))


### Bug Fixes

* **caclulate-shipping:** fix calculating amount tax (percentage) ([7ce8da9](https://github.com/ecomplus/app-custom-shipping/commit/7ce8da912d3642a8dd994ba00f2c1f9c21db9144))
* **deps:** replace ecomplus-app-sdk to @ecomplus/application-sdk@sqlite ([ba26529](https://github.com/ecomplus/app-custom-shipping/commit/ba26529d1e38b5de9c61ff911ec29ee5d90c7921))

## [1.0.0](https://github.com/ecomplus/app-custom-shipping/compare/v0.1.3...v1.0.0) (2020-04-10)

### [0.1.3](https://github.com/ecomplus/app-custom-shipping/compare/v0.1.2...v0.1.3) (2020-03-16)

### [0.1.2](https://github.com/ecomclub/app-custom-shipping/compare/v0.1.1...v0.1.2) (2020-01-02)


### Bug Fixes

* **calculate-shipping:** ensure some rule fields aren't undefined ([36ea19c](https://github.com/ecomclub/app-custom-shipping/commit/36ea19c5be3ccdf9433f46790e5c6ca328728516))

### [0.1.1](https://github.com/ecomclub/app-custom-shipping/compare/v0.1.0...v0.1.1) (2019-12-19)


### Bug Fixes

* **calculate-shipping:** fix calcule physical, cubic and final weight ([14b8b12](https://github.com/ecomclub/app-custom-shipping/commit/14b8b1240e5718e3dc86ff889f9dba8dd85ca0f7))

## 0.1.0 (2019-12-13)


### Features

* **calculate-shipping:** functional route returning filtered services ([df4d006](https://github.com/ecomclub/app-custom-shipping/commit/df4d006a5c9b6984a380ca2ca64ad474bccb16aa))


### Bug Fixes

* **server:** update express routes ([fbad832](https://github.com/ecomclub/app-custom-shipping/commit/fbad8325359dfd240cd7594b5f2d230414ab5f9c))
