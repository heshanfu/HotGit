import React, { Component } from 'react';
import {
  View,
  TouchableHighlight,
  StyleSheet,
  ScrollView,
  Text,
} from 'react-native';
import ComponentWithNavigationBar from '../../common/NavigatorBar';
import LanguageDAO, { FLAG_LANGUAGE } from '../../expand/dao/LanguageDAO';
import FavoriteDAO from '../../expand/dao/FavoriteDAO';
import UserDAO from '../../expand/dao/UserDAO';
import { MORE_MENU } from '../../common/MoreMenu';
import GlobalStyles from '../../../res/styles/GlobalStyles';
import ViewUtils from '../../util/ViewUtils';
import { Icon } from 'react-native-elements';
import CustomThemePage from './CustomTheme';
import BaseComponent from '../BaseComponent';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tips: {
    fontSize: 29,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    height: 60,
    backgroundColor: 'white',
  },
  groupTitle: {
    marginLeft: 10,
    marginTop: 10,
    marginBottom: 5,
    fontSize: 12,
    color: 'gray',
  },
});

export default class MyPage extends BaseComponent {
  constructor(props) {
    super(props);
    this.favoriteDAO = new FavoriteDAO();
    this.userDAO = new UserDAO();
    this.state = {
      user: null,
      avatar_url: null,
      customThemeViewVisible: false,
      theme: this.props.theme,
    };
  }

  componentDidMount() {
    super.componentDidMount();
    this.loadUser();
  }

  loadUser() {
    this.userDAO.loadCurrentUser().then(result => {
      this.setState({
        user: result,
      });
    });
    this.userDAO.loadUserAvatar().then(result => {
      this.setState({
        user_avatar: result,
      });
    });
  }

  logoutUser() {
    this.setState({
      user: null,
      user_avatar: null,
    });
  }

  renderCustomThemeView() {
    return (
      <CustomThemePage
        visible={this.state.customThemeViewVisible}
        {...this.props}
        onClose={() =>
          this.setState({
            customThemeViewVisible: false,
          })
        }
      />
    );
  }

  onClick(tab) {
    let TargetComponent,
      params = { ...this.props, menuType: tab };
    switch (tab) {
      case MORE_MENU.Custom_Language:
        TargetComponent = 'customKeyPage';
        params.flag = FLAG_LANGUAGE.flag_language;
        break;
      case MORE_MENU.Custom_Key:
        TargetComponent = 'customKeyPage';
        params.flag = FLAG_LANGUAGE.flag_key;
        break;
      case MORE_MENU.Remove_Key:
        TargetComponent = 'customKeyPage';
        params.flag = FLAG_LANGUAGE.flag_key;
        params.isRemoveKey = true;
        break;
      case MORE_MENU.Sort_Key:
        TargetComponent = 'sortKeyPage';
        params.flag = FLAG_LANGUAGE.flag_key;
        break;
      case MORE_MENU.Sort_Language:
        TargetComponent = 'sortKeyPage';
        params.flag = FLAG_LANGUAGE.flag_language;
        break;
      case MORE_MENU.Login:
        TargetComponent = 'loginPage';
        params.user = this.state.user;
        params.avatar_url = this.state.user_avatar;
        params.loadUser = () => this.loadUser();
        params.logoutUser = () => this.logoutUser();
        break;
      case MORE_MENU.Custom_Theme:
        this.setState({ customThemeViewVisible: true });
        break;
      case MORE_MENU.About_Author:
        TargetComponent = 'aboutMePage';
        break;
      case MORE_MENU.About:
        TargetComponent = 'aboutPage';
        break;
    }

    if (TargetComponent) {
      this.props.navigation.navigate(TargetComponent, {
        ...params,
        theme: this.state.theme,
      });
    }
  }

  getItem(tag, icon, text) {
    return ViewUtils.getSettingItem(
      () => this.onClick(tag),
      icon,
      text,
      this.state.theme.themeColor,
      null
    );
  }

  render() {
    let title = <Text style={GlobalStyles.titleText}>My Account</Text>;

    return (
      <View style={GlobalStyles.root_container}>
        {ComponentWithNavigationBar(
          title,
          null,
          null,
          this.state.theme.themeColor
        )}
        <ScrollView>
          <TouchableHighlight onPress={() => this.onClick(MORE_MENU.Login)}>
            <View style={[styles.row, { height: 90 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon
                  name="account-circle"
                  size={40}
                  color={this.state.theme.themeColor}
                  containerStyle={{ marginRight: 10 }}
                />
                <Text style={{ fontSize: 20 }}>
                  {this.state.user ? this.state.user : 'Account Login'}
                </Text>
              </View>
              <Icon
                name="keyboard-arrow-right"
                size={22}
                containerStyle={{ marginRight: 10 }}
                color={this.state.theme.themeColor}
              />
            </View>
          </TouchableHighlight>
          <View style={GlobalStyles.line} />

          {/*Trending Key setting*/}
          <Text style={styles.groupTitle}>Popular tab key setting</Text>
          <View style={GlobalStyles.line} />
          {this.getItem(MORE_MENU.Custom_Key, 'list', 'Custom Key')}
          <View style={GlobalStyles.line} />
          {/*Key Sort*/}
          {this.getItem(MORE_MENU.Sort_Key, 'sort', 'Sort Key')}
          <View style={GlobalStyles.line} />
          {/*Key remove*/}
          {this.getItem(MORE_MENU.Remove_Key, 'remove', 'Remove Key')}
          <View style={GlobalStyles.line} />

          {/*Popular setting*/}
          <Text style={styles.groupTitle}>Trending tab language setting</Text>
          <View style={GlobalStyles.line} />
          {this.getItem(MORE_MENU.Custom_Language, 'list', 'Custom Language')}
          <View style={GlobalStyles.line} />
          {/*Languate Sort*/}
          {this.getItem(MORE_MENU.Sort_Language, 'sort', 'Sort Language')}
          <View style={GlobalStyles.line} />

          {/*More setting*/}
          <Text style={styles.groupTitle}>More</Text>
          <View style={GlobalStyles.line} />
          {/*custom theme*/}
          {this.getItem(MORE_MENU.Custom_Theme, 'palette', 'Custom Theme')}
          <View style={GlobalStyles.line} />
          {/*About Author*/}
          {this.getItem(MORE_MENU.About, 'dashboard', 'About')}
          <View style={GlobalStyles.line} />
          {this.getItem(MORE_MENU.About_Author, 'mood', 'About Author')}
          <View style={GlobalStyles.line} />
        </ScrollView>
        {this.renderCustomThemeView()}

        {/*/!*Custom Pages*!/*/}
        {/*<Text style={styles.tips}*/}
        {/*onPress={() => {*/}
        {/*navigate('customKeyPage', {flag: FLAG_LANGUAGE.flag_key})*/}
        {/*}}>Custom Key</Text>*/}
        {/*<Text style={styles.tips}*/}
        {/*onPress={() => {*/}
        {/*navigate('customKeyPage', {flag: FLAG_LANGUAGE.flag_language})*/}
        {/*}}>Custom Languages</Text>*/}

        {/*/!*Sort Pages*!/*/}
        {/*<Text style={styles.tips}*/}
        {/*onPress={() => {*/}
        {/*navigate('sortKeyPage', {flag: FLAG_LANGUAGE.flag_language})*/}
        {/*}}>Sort Key</Text>*/}
        {/*<Text style={styles.tips}*/}
        {/*onPress={() => {*/}
        {/*navigate('sortKeyPage', {flag: FLAG_LANGUAGE.flag_language})*/}
        {/*}}>Sort Languages</Text>*/}

        {/*/!*Remove Pages*!/*/}
        {/*<Text style={styles.tips}*/}
        {/*onPress={() => {*/}
        {/*navigate('customKeyPage', {isRemoveKey: true, flag: FLAG_LANGUAGE.flag_key})*/}
        {/*}}>Remove Key</Text>*/}

        {/*/!*Reset*!/*/}
        {/*<Text style={styles.tips}*/}
        {/*onPress={() => {*/}
        {/*let languageDAO = new LanguageDAO(FLAG_LANGUAGE.flag_key)*/}
        {/*Alert.alert(*/}
        {/*'Note',*/}
        {/*'Do you want to reset keys?',*/}
        {/*[*/}
        {/*{text: 'NO', onPress: () => {}},*/}
        {/*{text: 'YES', onPress: () => languageDAO.resetKeys()},*/}
        {/*],*/}
        {/*{cancelable: false}*/}
        {/*)*/}
        {/*}}>Reset Default Keys</Text>*/}
        {/*<Text style={styles.tips}*/}
        {/*onPress={() => {*/}
        {/*let languageDAO = new LanguageDAO(FLAG_LANGUAGE.flag_key)*/}
        {/*Alert.alert(*/}
        {/*'Note',*/}
        {/*'Do you want to reset languages?',*/}
        {/*[*/}
        {/*{text: 'NO', onPress: () => {}},*/}
        {/*{text: 'YES', onPress: () => languageDAO.resetLangs()},*/}
        {/*],*/}
        {/*{cancelable: false}*/}
        {/*)*/}
        {/*}}>Reset Default Languages</Text>*/}

        {/*/!*Star and Unstar*!/*/}
        {/*<Text style={styles.tips}*/}
        {/*onPress={() => {*/}
        {/*userDAO.starRepo('apple/turicreate')*/}
        {/*.then(() => {*/}
        {/*DeviceEventEmitter.emit('showToast', 'Starred')*/}
        {/*})*/}
        {/*.catch(() => {*/}
        {/*DeviceEventEmitter.emit('showToast', 'Please Login...')*/}
        {/*})*/}
        {/*}}>Star</Text>*/}
        {/*<Text style={styles.tips}*/}
        {/*onPress={() => {*/}
        {/*userDAO.unstarRepo('apple/turicreate')*/}
        {/*.then(() => {*/}
        {/*DeviceEventEmitter.emit('showToast', 'Unstarred')*/}
        {/*})*/}
        {/*.catch(() => {*/}
        {/*DeviceEventEmitter.emit('showToast', 'Please Login...')*/}
        {/*})*/}
        {/*}}>Unstar</Text>*/}
        {/*<Text style={styles.tips}*/}
        {/*onPress={() => {*/}
        {/*userDAO.checkIfRepoStarred('apple/turicreate')*/}
        {/*.then((result) => {*/}
        {/*if (result === 1)*/}
        {/*DeviceEventEmitter.emit('showToast', 'starred')*/}
        {/*else*/}
        {/*DeviceEventEmitter.emit('showToast', 'Not starred')*/}
        {/*})*/}
        {/*.catch(() => {*/}
        {/*DeviceEventEmitter.emit('showToast', 'Please Login...')*/}
        {/*})*/}
        {/*}}>Check if starred</Text>*/}

        {/*<Text style={styles.tips}*/}
        {/*onPress={() => {*/}
        {/*userDAO.fetchStarredRepos()*/}
        {/*.then(() => {*/}
        {/*DeviceEventEmitter.emit('showToast', 'Starred')*/}
        {/*})*/}
        {/*.catch(() => {*/}
        {/*DeviceEventEmitter.emit('showToast', 'Please Login...')*/}
        {/*})*/}
        {/*}}>Starred Repos</Text>*/}

        {/*<Text style={styles.tips}*/}
        {/*onPress={() => {*/}
        {/*this.favoriteDAO.reloadStarredRepos()*/}
        {/*DeviceEventEmitter.emit('showToast', 'Reloaded')*/}
        {/*}}>Reload Repos</Text>*/}
      </View>
    );
  }
}
