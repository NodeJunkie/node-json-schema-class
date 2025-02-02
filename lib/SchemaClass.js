import merge from 'merge';
import events from 'events';
import pkg from 'ajv';
const Ajv = pkg.default;
const ajv = new Ajv({ useDefaults: true, logger: false });
/**
 * Throw Schema Error - Wrapper for generic schema errors
 * @param {Error} [err] Error to throw
 * @private
 */
export function SchemaError(err) {
  if (err) return new Error(err);
  return new Error('Unknown Error......');
}
/**
 * Where all things good come from! This Class uses JSON Schema Draft 4 to build
 *    basic models for the rest of the application. Please See json-schema.org
 *    and also ajv validator for the basics.
 *
 * @example
 *  import {SchemaClass} from 'json-schema-class';
 *  export MyClass extends 'SchemaClass'{
 *    constructor(){
 *      super({
 *        "title": "Example Schema",
 *        "type": "object",
 *        "properties": {
 *          "firstName": {
 *            "type": "string"
 *          },
 *          "lastName": {
 *            "type": "string"
 *          },
 *          "age": {
 *            "description": "Age in years",
 *            "type": "integer",
 *            "minimum": 0
 *          }
 *        },
 *        "required": ["firstName", "lastName"]
 *      });
 *
 *      let model = this;
 *      model.firstName = "My"
 *      model.lastName = "Class"
 *
 *      this.validate(model) //Validate model and add missing defaults
 *    )
 *  }
 */
export class SchemaClass {
  /**
   * A valid JSON Schema for this class. You can find examples
   * at http://json-schema.org/examples.html. There is also a
   * generator for JSON data. http://jsonschema.net/#/
   * @example
   *  {
 *    "title": "Example Schema",
 *    "type": "object",
 *    "properties": {
 *      "firstName": {
 *        "type": "string"
 *      },
 *      "lastName": {
 *        "type": "string"
 *      },
 *      "age": {
 *        "description": "Age in years",
 *        "type": "integer",
 *        "minimum": 0
 *      }
 *    },
 *    "required": ["firstName", "lastName"]
 *  }
   *
   * @see http://json-schema.org/
   * @typedef {Object} Schema
   */

  /**
   * Accepts a JSON Schema pattern for Model Building
   * @param {Schema} schema Schema for the new Class
   */
  constructor(schema) {
    /**
     * The Schema for this Class
     * @type {Schema}
     * @see http://json-schema.org/
     * @abstract
     */
    this.schema = null;

    if (schema) this.schema = schema;

    /**
     * Class Validator - Instance of ajv.compile()
     * @see https://www.npmjs.com/package/ajv#compileobject-schema---functionobject-data
     * @abstract
     */
    this.validator = null;

    /**
     * Event Emitter
     * @see https://nodejs.org/api/events.html
     */
    this.events = new events.EventEmitter();

    /**
     * A Merge utility for JavaScript Objects
     * @see https://github.com/yeikos/js.merge
     */
    this.merge = merge;
  }

  /**
   * Set the Current Schema
   * @param {Schema} schema JSON Schema 4
   * @private
   */
  setSchema(schema) {
    if (schema) this.schema = schema;
    else this.schemaError(ReferenceError('Must Specify Schema!'));
  }

  /**
   *
   * @returns {null}
   * @private
   */
  getValidator() {
    if (!this.validator) throw SchemaError(new ReferenceError('Must run setValidator first!'));
    return this.validator;
  }

  /**
   * Set a Schema Validator to the current instance
   * @returns {Object}
   * @private
   */
  setValidator(schema) {
    if (schema) this.setSchema(schema);
    this.validator = ajv.compile(this.getSchema());
    return this.validator;
  }

  /**
   * Get the Current Schema
   * @returns {Schema}
   */
  getSchema() {
    if (!this.schema) throw SchemaError();
    return this.schema;
  }

  /**
   * Validate data against the current schema
   * @param {Object} data
   * @returns {Object} data
   */
  validate(data) {
    if (!this.validator) this.setValidator();
    const valid = this.getValidator();
    if (valid && valid(data)) return data;
    throw SchemaError(valid.errors[0]);
  }
}
