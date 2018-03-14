const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');

const initJson = require('init-package-json');
const DownloadGit = require('download-git-repo');

const path = require('path');
const fsextra = require('fs-extra');
const replaceInFile = require('replace-in-file');
const formatJson = require('format-json');

const archiveDir = 'temp';
const defaultComponentName = 'react-component-template';
const defaultGlobalComponentName = 'ReactComponentTemplate';// eslint-disable-line
let defaultPackageJson = {};
let newComponentName = '';
let newGlobalComponentName = '';// eslint-disable-line

module.exports = class extends Generator {
  initializing() {
    this.log(
      yosay(`
      Welcome to the ${chalk.red('generator-react-component-magic')} generator!
      `)
    );
  }

  async executeMethod() {
    this.log('execute start');
    // 1. 下载包
    await this._downloadTemplate();// eslint-disable-line

    // 2. 复制指定的文件到工作目录下
    await this._copyTemplate();// eslint-disable-line

    // 4. merge package.json
    await this._mergePackageJson();// eslint-disable-line

    // 5. 读取package.json信息，修改模板中的占位符
    await this._handlePlaceHolder();// eslint-disable-line
    // 完毕
  }

  // 1. 下载包
  // TODO 显示下载进度
  _downloadTemplate() {
    this.log(
      'download template from https://github.com/58-magic/react-component-template'
    );
    this.log(`${chalk.red('......')}`);
    return new Promise(resolve =>
      DownloadGit(
        'https://github.com:58-magic/react-component-template',
        archiveDir,
        err => {
          // TODO 错误捕获
          err ? this.log(`${chalk.red(err)}`) : this.log('downloaded');// eslint-disable-line
          resolve();// eslint-disable-line
        }
      )
    );
  }

  // 2. 复制指定的文件到工作目录下
  _copyTemplate() {
    this.log('copy template');
    // 记录默认的package.json数据
    defaultPackageJson = fsextra.readJsonSync(
      this._getFilePath(archiveDir, 'package.json')// eslint-disable-line
    );
    // 删除无用文件
    const deleteFileArr = ['LICENSE', 'package-lock.json', 'README.md', 'package.json'];
    deleteFileArr.forEach(name => fsextra.removeSync(this._getFilePath(archiveDir, name)));// eslint-disable-line

    // 复制，自动删除了archiveDir目录
    fsextra.moveSync(this._getFilePath(archiveDir, '.'), process.cwd());// eslint-disable-line

    this.log('copy template done!');
    return Promise.resolve();
  }

  // 3. merge package.json
  _mergePackageJson() {
    this.log('init package.json');
    const initFile = path.resolve(process.env.HOME, '.npm-init');

    // the dir where we're doin stuff.
    const dir = process.cwd();

    const configData = {};

    return new Promise(resolve =>
      initJson(dir, initFile, configData, (err, data) => {
        // TODO 错误捕获
        err ? this.log(`${chalk.red(err)}`) : this.log('package.json done!');// eslint-disable-line
        const config = Object.assign({}, defaultPackageJson, {
          name: data.name,
          version: data.version,
          description: data.description,
          author: data.author,
          repository: data.repository,
          bugs: data.bugs,
          homepage: data.homepage
        });
        newComponentName = config.name;
        //
        newGlobalComponentName = newComponentName
          .split('-')
          .map(letter => letter[0].toUpperCase() + letter.slice(1))
          .join('');

        fsextra.writeFileSync(
          this._getFilePath('.', 'package.json'), // eslint-disable-line
          formatJson.plain(config)
        );
        resolve();
      })
    );
  }

  // 4. 修改模板中的占位符
  _handlePlaceHolder() {
    this.log('handle placeholder');
    // TODO 如此执行效率最高，但配置是写死了
    // 如果要拓展可以写成搜索全目录下的placeholder
    const opt1 = {
      files: [
        path.join(process.cwd(), 'webpack.config.js'),
        path.join(process.cwd(), 'rollup.config.js'),
        path.join(process.cwd(), 'examples/src/app.js')
      ],
      from: defaultComponentName,
      to: newComponentName
    };
    // replaceInFile(options);
    replaceInFile.sync(opt1);

    const opt2 = {
      files: path.join(process.cwd(), 'rollup.config.js'),
      from: defaultGlobalComponentName,
      to: newGlobalComponentName
    };
    replaceInFile.sync(opt2);
    this.log('finish !');
  }

  // 获取文件路径
  /* eslint-disable */
  _getFilePath(pathname, filename) {
    return path.join(process.cwd(), pathname, filename);
  }
};
