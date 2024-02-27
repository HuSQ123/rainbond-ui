/* eslint-disable react/react-in-jsx-scope */
import { formatMessage } from 'umi-plugin-locale';
import roleUtil from '../utils/role';
import { isUrl } from '../utils/utils';
import getMenuSvg from './getMenuSvg';

function menuData(teamName, regionName, appID, permissionsInfo) {
  const appPermissions = roleUtil.querySpecifiedPermissionsInfo(
    permissionsInfo,
    'queryAppInfo'
  );

  const control = roleUtil.queryControlInfo(permissionsInfo, 'describe');
  const isAppConfigGroup = roleUtil.queryAppConfigGroupInfo(
    permissionsInfo,
    'describe'
  );
  const { isShare, isBackup, isUpgrade } = appPermissions;
  const menuArr = [
    {
      name: formatMessage({ id: 'menu.app.dashboard' }),
      icon: getMenuSvg.getSvg('dashboard'),
      path: `team/${teamName}/region/${regionName}/apps/${appID}`,
      authority: ['admin', 'user']
    }
  ];

  function addMenuArr(obj) {
    menuArr.push(obj);
  }

  if (isShare) {
    addMenuArr({
      name: formatMessage({ id: 'menu.app.publish' }),
      icon: getMenuSvg.getSvg('publish'),
      path: `team/${teamName}/region/${regionName}/apps/${appID}/publish`,
      authority: ['admin', 'user']
    });
  }

  if (control) {
    addMenuArr({
      name: formatMessage({ id: 'menu.app.gateway' }),
      icon: getMenuSvg.getSvg('gateway'),
      path: `team/${teamName}/region/${regionName}/apps/${appID}/gateway`,
      authority: ['admin', 'user']
    });
  }
  if (isUpgrade) {
    addMenuArr({
      name: formatMessage({ id: 'menu.app.upgrade' }),
      icon: getMenuSvg.getSvg('upgrade'),
      path: `team/${teamName}/region/${regionName}/apps/${appID}/upgrade`,
      authority: ['admin', 'user']
    });
  }
  if (isAppConfigGroup) {
    addMenuArr({
      name: formatMessage({ id: 'menu.app.configgroups' }),
      icon: getMenuSvg.getSvg('setting'),
      path: `team/${teamName}/region/${regionName}/apps/${appID}/configgroups`,
      authority: ['admin', 'user']
    });
  }
  addMenuArr({
    name: formatMessage({ id: 'menu.app.k8s' }),
    icon: getMenuSvg.getSvg('kubenetes'),
    path: `team/${teamName}/region/${regionName}/apps/${appID}/resource`,
    authority: ['admin', 'user']
  });
  return menuArr;
}

function formatter(data, parentPath = '', parentAuthority) {
  return data.map(item => {
    let { path } = item;
    if (!isUrl(path)) {
      path = parentPath + item.path;
    }
    const result = {
      ...item,
      path,
      authority: item.authority || parentAuthority
    };
    if (item.children) {
      result.children = formatter(
        item.children,
        `${parentPath}${item.path}/`,
        item.authority
      );
    }
    return result;
  });
}

export const getAppMenuData = (
  teamName,
  regionName,
  appID,
  permissionsInfo
) => {
  const menus = formatter(
    menuData(teamName, regionName, appID, permissionsInfo)
  );
  return menus;
};
