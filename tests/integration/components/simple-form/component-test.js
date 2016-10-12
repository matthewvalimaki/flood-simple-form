import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import {
  validatePresence,
  validateLength
} from 'ember-changeset-validations/validators';

const { run } = Ember;

moduleForComponent('simple-form', 'Integration | Component | simple form', {
  integration: true
});

const validations = {
  number: [
    validatePresence(true),
    validateLength({ min: 8, max: 10 })
  ]
};

test('it renders a form', function(assert) {
  this.set('user', {
    number: '415 000 0000'
  });

  this.render(hbs`
    {{#simple-form (changeset user) as |f|}}
      {{f.input "number" type="tel" placeholder="(•••) ••• ••••" label="Phone Number" hint="Your Phone Number"}}
    {{/simple-form}}
  `);

  assert.equal(this.$('.SimpleForm form').length, 1, 'first section is presented as a form tag');
  assert.equal(this.$('.number p.SimpleForm-hint').text().trim(), 'Your Phone Number', 'it renders a hint');
});

test('it propagates changeset to form inputs', function(assert) {
  this.set('user', {
    number: '415 000 0000'
  });

  this.render(hbs`
    {{#simple-form (changeset user) as |f|}}
      {{f.input "number" type="tel" placeholder="(•••) ••• ••••" label="Phone Number" hint="Your Phone Number"}}
    {{/simple-form}}
  `);

  assert.equal(this.$('.number input').val().trim(), '415 000 0000', 'it renders initial number');

  this.set('user', {
    number: 'N/A'
  });

  assert.equal(this.$('.number input').val().trim(), 'N/A', 'it renders updated number');
});

test('it emits change events when a field changes', function(assert) {
  assert.expect(1);

  this.set('user', {
    number: '415 000 0000'
  });

  this.on('handleInputValueChange', function(changeset) {
    assert.deepEqual(changeset.get('changes'), [
      {
        'key': 'email',
        'value': 'user@flood.io'
      }
    ], 'email field changed');
  });

  this.render(hbs`
    {{#simple-form (changeset user) on-change=(action "handleInputValueChange") as |f|}}
      {{f.input "email" type="email"}}
    {{/simple-form}}
  `);

  this.$('.email input').val('user@flood.io').change();
});

test('inputs support blocks', function(assert) {
  this.set('user', {
    number: '415 000 0000'
  });

  this.render(hbs`
    {{#simple-form (changeset user) as |f|}}
      {{#f.input "email" type="block" as |input|}}
        <p class="yielded">{{input.someInternalPropertyOnInput}}</p>
      {{/f.input}}
    {{/simple-form}}
  `);

  assert.equal(this.$('.yielded').text(), 'TEST', 'has yielded label');
  assert.equal(this.$('p.name').text(), 'Block Dummy Component', 'has component content');
});

test('it displays errors if present on model', function(assert) {
  this.set('user', {
    number: '415 000'
  });

  this.set('Validations', validations);
  this.on('save', (changeset) => changeset.validate());
  this.on('reset', (changeset) => changeset.rollback());

  this.render(hbs`
    {{#simple-form (changeset user Validations) on-submit=(action "save") as |f|}}
      {{f.input "number" type="tel"}}
      {{f.submit "Save"}}
    {{/simple-form}}
  `);

  this.$('.number input').val('0432').trigger('change');
  run(() => this.$('button:contains("Save")').click());

  assert.equal(this.$('.number .SimpleForm-errors').text(), 'Number must be between 8 and 10 characters', 'it renders errors');
  assert.ok(this.$('.number input').hasClass('invalid'), 'it applies an invalid class to the input');
});
