'use strict'
const request = require('supertest')
const HTMLParser = require('node-html-parser');
const appFactory = require('../app');

beforeAll(() => {
  /* Turn off console.log */
  jest.spyOn(console, 'log').mockImplementation(jest.fn())
  /* Turn off console.debug */
  jest.spyOn(console, 'debug').mockImplementation(jest.fn())
})

describe('App can be configured', () => {
  test('Can be configured through factory', async () => {
    const app = await appFactory({ APP_TITLE: 'Test App' })
    expect(app.locals.appTitle).toBe('Test App')
  })

  test('Falsey config values can be passed to app through factory', async () => {
    const app = await appFactory({ DISABLE_X_POWERED_BY: false })
    expect(app.locals.disableXPoweredBy).toBe(false)
    const res = await request(app).get('/')
    expect(res.header['x-powered-by']).toBe('Express')
  })
})

describe('Test the root path', () => {
  test('It should respond to the GET method', async () => {
    const app = await appFactory()
    const res = await request(app).get('/')
    expect(res.statusCode).toBe(200)
  })

  test('x-powered-by should not be there', async () => {
    const app = await appFactory()
    const res = await request(app).get('/')
    expect(res.header['x-powered-by']).toBeUndefined()
  })

  test('Content-type should be text/html', async () => {
    const app = await appFactory()
    const res = await request(app).get('/')
    expect(res.header['content-type']).toBe('text/html; charset=utf-8')
  })
})

describe('Test class rendering', () => {
  test('It should render the index page', async () => {
    const app = await appFactory()
    const res = await request(app).get('/_tests_/')
    const dom = HTMLParser.parse(res.text)
    const content = dom.querySelector('body > h1').innerHTML
    expect(content).toBe('Hello Zest!')
  })

  test('Index should have an extra div with placeholder', async () => {
    const app = await appFactory()
    const res = await request(app).get('/_tests_/')
    const dom = HTMLParser.parse(res.text)
    const content = dom.querySelector('body > div').innerHTML
    expect(content).toBe('{{addOn}}')
  })

  test('Clone should render the inherited index page', async () => {
    const app = await appFactory()
    const res = await request(app).get('/_tests_/clone')
    const dom = HTMLParser.parse(res.text)
    const content = dom.querySelector('body > h1').innerHTML
    expect(content).toBe('Hello Zest!')
  })

  test('Clone should render the addon div', async () => {
    const app = await appFactory()
    const res = await request(app).get('/_tests_/clone')
    const dom = HTMLParser.parse(res.text)
    const content = dom.querySelector('#addon').innerHTML
    expect(content).toBe('Additional Markup')
  })
})

describe('Test partials', () => {
  test('GET method handler returns partial', async () => {
    const app = await appFactory()
    const res = await request(app)
      .get('/_tests_/a?_fragment=list')
      .set('HX-Request', 'true')
    const dom = HTMLParser.parse(res.text)
    const content = dom.querySelector('ol > #train').innerHTML
    expect(content).toBe('train')
  })

  test('GET method handler returns requested partial', async () => {
    const app = await appFactory()
    const res = await request(app)
      .get('/_tests_/a?_fragment=unorderedList')
      .set('HX-Request', 'true')
    const dom = HTMLParser.parse(res.text)
    const content = dom.querySelector('ul > #train').innerHTML
    expect(content).toBe('train')
  })
})

describe('Test a bogus path', () => {
  test('It should respond with a 404', async () => {
    const app = await appFactory({ ENABLE_404: true })
    const res = await request(app).get('/bogus')
    expect(res.statusCode).toBe(404)
  })

  test('It should respond with a 200', async () => {
    const app = await appFactory()
    const res = await request(app).get('/bogus')
    expect(res.statusCode).toBe(200)
  })
})

describe('Control when a 404 is fired', () => {
  test('A 404 file throws a 404', async () => {
    const app = await appFactory()
    const res = await request(app).get('/_tests_/c')
    expect(res.statusCode).toBe(404)
    const dom = HTMLParser.parse(res.text)
    const content = dom.querySelector('div').innerHTML
    expect(content).toBe('Early 404')
  })
})

describe('Test authentication', () => {
  test('authenticate flag triggers 302', async () => {
    const app = await appFactory()
    const res = await request(app).get('/_tests_/a/auth')
    expect(res.statusCode).toBe(302)
  })
})

describe('Test path params', () => {
  test('path param is blank', async () => {
    const app = await appFactory()
    const res = await request(app).get('/_tests_/b/x/y/z')
    const dom = HTMLParser.parse(res.text)
    const content = dom.querySelector('#addOn').innerHTML
    expect(content).toBe('x:y:z')
  })
})

// const showPage = (res) => {
//   console.dir(res.text)
//   console.dir(res.headers)
//   console.dir(res.status)
// }
