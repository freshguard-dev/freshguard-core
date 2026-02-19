# Class: ErrorHandler

Defined in: [src/errors/index.ts:546](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/errors/index.ts#L546)

Utility class for error handling and sanitization

## Constructors

### Constructor

> **new ErrorHandler**(): `ErrorHandler`

#### Returns

`ErrorHandler`

## Methods

### getErrorCode()

> `static` **getErrorCode**(`error`): `string`

Defined in: [src/errors/index.ts:605](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/errors/index.ts#L605)

Get error code for API responses

#### Parameters

##### error

`unknown`

#### Returns

`string`

***

### getUserMessage()

> `static` **getUserMessage**(`error`): `string`

Defined in: [src/errors/index.ts:597](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/errors/index.ts#L597)

Get user-safe error message

#### Parameters

##### error

`unknown`

#### Returns

`string`

***

### sanitize()

> `static` **sanitize**(`error`): [`FreshGuardError`](FreshGuardError.md)

Defined in: [src/errors/index.ts:550](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/errors/index.ts#L550)

Sanitize any error to prevent information leakage

#### Parameters

##### error

`unknown`

#### Returns

[`FreshGuardError`](FreshGuardError.md)

***

### shouldLogDetails()

> `static` **shouldLogDetails**(`error`): `boolean`

Defined in: [src/errors/index.ts:586](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/errors/index.ts#L586)

Check if error should be logged with full details (for debugging)

#### Parameters

##### error

[`FreshGuardError`](FreshGuardError.md)

#### Returns

`boolean`
