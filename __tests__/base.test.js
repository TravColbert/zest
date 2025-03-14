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

// describe('App can be configured through shell environment', () => {
//   // Make a copy of current environment
//   const OLD_ENV = process.env

//   beforeEach(() => {
//     jest.resetModules() // Most important - it clears the cache
//     process.env = { ...OLD_ENV } // Make a copy
//   })

//   afterAll(() => {
//     process.env = OLD_ENV // Restore old environment
//   })
// })

describe('App can be configured explicitly through factory', () => {
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
  var app

  beforeEach(async () => {
    app = await appFactory({ AUTHENTICATE: "none" })
  })

  test('It should respond correctly to the GET method', async () => {
    const res = await request(app).get('/')
    expect(res.statusCode).toBe(200)
    expect(res.header['x-powered-by']).toBeUndefined()
    expect(res.header['content-type']).toBe('text/html; charset=utf-8')
  })
})

describe('Test class rendering', () => {
  var app

  beforeEach(async () => {
    app = await appFactory({ AUTHENTICATE: "none" })
  })

  test('It should render the index page', async () => {
    const res = await request(app).get('/_tests_/')
    const dom = HTMLParser.parse(res.text)
    const content = dom.querySelector('body > h1').innerHTML
    expect(content).toBe('Hello Zest!')
  })

  test('Index should have an extra div with placeholder', async () => {
    const res = await request(app).get('/_tests_/')
    const dom = HTMLParser.parse(res.text)
    const content = dom.querySelector('body > div').innerHTML
    expect(content).toBe('{{addOn}}')
  })

  test('Clone should render the inherited index page', async () => {
    const res = await request(app).get('/_tests_/clone')
    const dom = HTMLParser.parse(res.text)
    const content = dom.querySelector('body > h1').innerHTML
    expect(content).toBe('Hello Zest!')
  })

  test('Clone should render the addon div', async () => {
    const res = await request(app).get('/_tests_/clone')
    const dom = HTMLParser.parse(res.text)
    const content = dom.querySelector('#addOn').innerHTML
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

  // Should probably respond with a redirect 302 to the root
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

describe('Test base authentication', () => {
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

describe('Test GETs', () => {
  test('GET to todos returns list of todos', async () => {
    const app = await appFactory()
    const res = await request(app).get('/_tests_/todos')
    const dom = HTMLParser.parse(res.text)
    const content = dom.querySelector('#todos_2_title').innerHTML
    expect(content).toBe('Write my first Zest app')
  })
})

describe('Test POSTs', () => {
  test('POST to todos returns updated list of todos', async () => {
    const app = await appFactory()
    let res = await request(app)
      .post('/_tests_/todos/')
      .send({ title: 'Post a new todo' })
      .set('Accept', 'application/json')
    res = await request(app).get('/_tests_/todos')
    const dom = HTMLParser.parse(res.text)
    const content = dom.querySelector('#todos_4_title').innerHTML
    expect(content).toBe('Post a new todo')
  })
})

describe('Test Authentication', () => {
  test('Test sample auth', async () => {
    /**
     * We pass the AUTHENTICATE variable the library in /auth/ that we want to
     * use for authentication. Here we pass 'sample' which corresponds to 
     * ./auth/sample.js which loads passport local authentication with sample
     * user db included in the file
     */
    const app = await appFactory({ APP_TITLE: 'Sample Authentication App', AUTHENTICATE: 'local', DEBUG: true })
    expect(app.locals.appTitle).toBe('Sample Authentication App')
    var res = await request(app).get('/_tests_/a/auth')
    // Should get a 302 redirect to login page
    expect(res.statusCode).toBe(302)

    // Post to login page
    res = await request(app)
      .post('/_tests_/a/login')
      .send({ username: 'demo', password: 'demo' })
      .set('Accept', 'application/json')

    // Should get a 302 redirect to originally requested page
    expect(res.statusCode).toBe(302)
    expect(res.header.location).toBe('/_tests_/a/auth')

    // const dom = HTMLParser.parse(res.text)
    // const content = dom.querySelector('#addOn').innerHTML
    // expect(content).toBe('x:y:z')
  })
  // test('Test OKTA OIDC ', async () => {
  //   // We pass the AUTHENTICATE variable the library in /auth/ that we want to use for authentication
  //   const app = await appFactory({ APP_TITLE: 'Test App', AUTHENTICATE: 'oidc' })
  //   expect(app.locals.appTitle).toBe('Test App')
  // })
})

// const showPage = (res) => {
//   console.dir(res.text)
//   console.dir(res.headers)
//   console.dir(res.status)
// }
