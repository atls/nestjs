import assert               from 'node:assert/strict'
import { it }               from 'node:test'

import { NestFactory }      from '@nestjs/core'
import { IsEmail }          from 'class-validator'

import { ValidationError }  from '../errors/index.js'
import { Validator }        from '../validator/index.js'
import { ValidationModule } from './validation.module.js'

class Contact {
  @IsEmail()
  email: string
}

it('resolves the exported validator and transforms valid input', async () => {
  const application = await NestFactory.createApplicationContext(ValidationModule.register(), {
    logger: false,
  })

  try {
    const contact = await application
      .get(Validator)
      .validate<Contact>({ email: 'person@example.com' }, Contact)

    assert.ok(contact instanceof Contact)
    assert.equal(contact.email, 'person@example.com')
  } finally {
    await application.close()
  }
})

it('preserves validation errors for invalid input', async () => {
  const application = await NestFactory.createApplicationContext(ValidationModule.register(), {
    logger: false,
  })

  try {
    await assert.rejects(application.get(Validator).validate({ email: 'invalid' }, Contact), (
      error: unknown
    ) => {
      assert.ok(error instanceof ValidationError)
      assert.equal(error.errors[0].property, 'email')
      assert.ok(error.errors[0].constraints?.isEmail)
      return true
    })
  } finally {
    await application.close()
  }
})
