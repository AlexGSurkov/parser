'use strict';

const phantom = require('phantom');

class ILine {
  constructor() {
    this.lineName = undefined;
    this._instance = null;
  }

  getLineName() {
    return this.lineName;
  }

  info() {
    console.log(`\x1b[32m${this.lineName} parser info: `, '\x1b[30m', ...arguments); //eslint-disable-line no-console
  }

  error() {
    console.log(`\x1b[31m${this.lineName} parser error: `, ...arguments); //eslint-disable-line no-console
    //console.error(...arguments);
  }

  async create() {
    !this._instance && (this._instance = await phantom.create());
  }


  async createPage() {
    await this.create();

    const page = await this._instance.createPage();

    //await page.on('onResourceRequested', function(requestData) {
    //  this.info('Requesting', requestData.url);
    //});

    return page;
  }

  async exit() {
    if (this._instance) {
    await this._instance.exit();
      this._instance = null;
      this.info('exit');
    }
  }

  /**
   * parse page
   *
   */


  async parse(source, parseFunc, logContent = false, delayPeriod = 0) {
    let page, status = '';

    if (typeof source === 'string') {
      page = await this.createPage();

      await page.setting('loadImages', false);

      const userAgent = await page.setting('userAgent');

      await page.setting('userAgent', userAgent.substring(0, userAgent.indexOf('PhantomJS')) + 'Chrome/65.0.3325.162 ' + userAgent.substring(userAgent.indexOf('Safari')));

      await page.setting('loadImages', false);

      status = await page.open(source);
    } else {
      page = source;
      status = 'success';
    }

    if (delayPeriod) {
      await delay(delayPeriod);
    }

    if (page && status === 'success') {
      this.info(status);

      if (logContent) {
        const content = await page.property('content');

        this.info(content);
      }

      //console.log('javascriptEnabled', await page.setting('javascriptEnabled'));

      return {
        result: await page.evaluateJavaScript(parseFunc),
        page
      };
    }

    this.error(`Page isn't loaded`);

    return {
      result: null,
      page: null
    };

  }

}

module.exports = ILine;

const delay = time => new Promise(res => setTimeout(() => res(), time));
