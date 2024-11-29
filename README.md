# json-schema-class 
[![Build Status](https://travis-ci.com/NodeJunkie/node-json-schema-class.svg?branch=master)](https://travis-ci.com/NodeJunkie/node-json-schema-class)
[![codecov.io](https://codecov.io/github/NodeJunkie/node-json-schema-class/coverage.svg?branch=master)](https://codecov.io/github/NodeJunkie/node-json-schema-class?branch=master)
[![esdocs](http://nodejunkie.github.io/node-json-schema-class/badge.svg)](http://nodejunkie.github.io/node-json-schema-class/)
[![Issue Count](https://codeclimate.com/github/NodeJunkie/node-json-schema-class/badges/issue_count.svg)](https://codeclimate.com/github/NodeJunkie/node-json-schema-class)
[![Dependencies](https://david-dm.org/nodejunkie/node-json-schema-class.svg)](https://david-dm.org/nodejunkie/node-json-schema-class#info)
[![devDependency Status](https://david-dm.org/nodejunkie/node-json-schema-class/dev-status.svg)](https://david-dm.org/nodejunkie/node-json-schema-class#info=devDependencies)

![codecov.io](https://codecov.io/github/NodeJunkie/node-json-schema-class/branch.svg?branch=master)

Base Class that includes JSON Schema validations via ajv package.

## Installing

```bash
npm install json-schema-class --save
```

## Importing

```JavaScript
import SchemaClass from 'json-schema-class';
```


## SchemaClass Public Methods


You should be able to validate the class itself against the current
schema draft. You can also store the model data in a class prop
and validate it in the constructor/methods/other props.
@test {SchemaClass}


#### It is able create a basic validator class

```javascript
    // ES6
const Validator = new SchemaClass({
  type: 'string',
});

// Using a valid input
const text = Validator.validate('Input Text');
expect(text).to.equal('Input Text');

// Using an invalid input
expect(() => {
  Validator.validate(1);
}).to.throw(Error);
```

#### It is able to use extends

```javascript
    class SimpleClass extends SchemaClass {
  constructor(text) {
    super({
      type: 'string',
      enum: ['Text'],
    });

    this.validate(text);
  }
}
expect(SimpleClass).to.exist;

const SimpleModel = new SimpleClass('Text');

expect(SimpleModel).to.exist;
```

#### It is able to create new instances with defaults

```javascript
    class WithDefaults extends SchemaClass {
  constructor(id) {
    super({
      type: 'object',
      properties: {
        id: {
          type: 'string',
        },
        check: {
          type: 'string',
          default: 'This is a default value',
        },
      },
      required: ['id'],
    });

    this.id = id;

    this.validate(this);
  }
}

// On the import side you can instantiate it like so
const defaultTest = new WithDefaults('1');

// Expect find the class model's id
expect(defaultTest.id).to.exist;

// Any defaults should exist after creating a new instance
expect(defaultTest.check).to.exist;
```

#### It is able to validate the model data

```javascript
    class BadData extends SchemaClass {
  constructor(id) {
    super({
      type: 'object',
      properties: {
        id: {
          type: 'string',
        },
      },
      required: ['id'],
    });

    /**
     * Do anything you need to do with the data model
     * You can create a custom Model placeholder or
     * validate the class directly like so
     *
     * let model = this;
     *  - or -
     * let model = {}
     */
    const model = this;
    model.id = 1;

    this.validate(model);
  }
}

expect(BadData).to.exist;

expect(() => {
  new BadData(1);
}).to.throw(Error);
```

## SchemaClass Private Methods


Private methods for the SchemaClass are used to set and get
the current schema for the class. Future plans are to expand
this to include the caching features of ajv


#### It is able to get and set the schema

```javascript
    const myObj = new SchemaClass();

expect(myObj.getSchema).to.exist;

expect(() => {
  myObj.getSchema();
}).to.throw(Error);

expect(myObj.setSchema).to.exist;

expect(() => {
  myObj.setSchema();
}).to.throw(Error);

expect(() => {
  myObj.setSchema({
    type: 'string',
  });
}).to.not.throw(Error);

expect(myObj.schema).to.deep.equal({
  type: 'string',
});

expect(() => {
  myObj.getSchema();
}).to.not.throw(Error);

expect(myObj.getSchema()).to.deep.equal({
  type: 'string',
});
```

#### It is able to get and set a validator

```javascript
    const myObj = new SchemaClass({
  type: 'string',
});

expect(myObj.getValidator).to.exist;

let test = null;

/**
 * The Validator will fail if setValidator is not triggered
 */
expect(() => {
  test = myObj.getValidator();
}).to.throw(Error);

expect(() => {
  myObj.setValidator();
}).to.not.throw(Error);

expect(() => {
  test = myObj.getValidator();
}).to.not.throw(Error);

expect(test).to.exist;

expect(myObj.schema).to.deep.equal({
  type: 'string',
});

expect(() => {
  myObj.validate('Input Text');
}).to.not.throw(Error);

expect(() => {
  myObj.validate(1);
}).to.throw(Error);

expect(() => {
  myObj.setValidator({
    type: 'number',
  });
}).to.not.throw(Error);

expect(() => {
  myObj.validate('Input Text');
}).to.throw(Error);

expect(() => {
  myObj.validate(1);
}).to.not.throw(Error);

expect(myObj.schema).to.deep.equal({
  type: 'number',
});
```

