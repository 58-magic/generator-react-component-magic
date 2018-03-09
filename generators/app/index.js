const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');

const initJson = require('init-package-json');
const DownloadGit = require('download-git-repo');

const path = require('path');
const fsextra = require('fs-extra');

const archiveDir = 'temp';
// const defaultComponentName = 'react-component-template';

module.exports = class extends Generator {
  initializing() {
    this.log(
      yosay(`
      Welcome to the phenomenal ${chalk.red('generator-react-component-magic')} generator!
      `)
    );
    this._download();// eslint-disable-line
  }

  _writeJson() {
    this.log('merge package.json');
    const initFile = path.resolve(process.env.HOME, '.npm-init');

    // the dir where we're doin stuff.
    const dir = process.cwd();

    const configData = {};

    initJson(dir, initFile, configData, err => {
      // TODO 错误捕获
      err ? this.log(err) : this.log('package.json done!');// eslint-disable-line
    });
  }

  // 下载模版
  // TODO 显示下载进度
  _download() {
    this.log(
      'download template from https://github.com/58-magic/react-component-template'
    );
    DownloadGit(
      'https://github.com:58-magic/react-component-template',
      archiveDir,
      err => {
        // TODO 错误捕获
        err ? this.log(err) : this.log('downloaded');// eslint-disable-line
        this._handleArchive();// eslint-disable-line
      }
    );
  }

  _getFilePath(filename) {
    this.log(`handle ${filename}`);
    return path.join(process.cwd(), archiveDir, filename);
  }

  _handleArchive() {
    this.log('handleArchive');
    this.log(this._getFilePath('.'));//eslint-disable-line
    // 删除无用文件 封装
    const deleteFileArr = ['LICENSE', 'package-lock.json', 'README.md'];
    deleteFileArr.forEach(name => fsextra.removeSync(this._getFilePath(name)));// eslint-disable-line

    // TODO 替换文件

    // 复制，自动删除了archiveDir目录
    fsextra.moveSync(this._getFilePath('.'), process.cwd());// eslint-disable-line

    this.log('handle done!');

    // merge package.json
    this._writeJson();// eslint-disable-line
  }
};
