import React, { Component } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import GlobalStyles from '../../../res/styles/GlobalStyles';
import AboutCommon, { FLAT_ABOUT } from '../about/AboutCommon';
import UserDAO from '../../expand/dao/UserDAO';
import { Button } from 'react-native-elements';

let userDAO = new UserDAO();

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tips: {
    fontSize: 20,
    width: 100,
  },
  input: {
    height: 35,
    flex: 1,
    alignSelf: 'center',
    paddingLeft: 5,
    marginRight: 10,
    marginLeft: 5,
    borderRadius: 3,
    opacity: 0.7,
    color: 'black',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    margin: 10,
  },
  button: {
    width: 120,
    borderRadius: 3,
  },
});

export default class LoginPage extends Component {
  constructor(props) {
    super(props);
    const { state } = this.props.navigation;
    this.user = state.params.user;
    this.avatar_url = state.params.avatar_url;
    this.username = 'ztlevitest';
    this.password = 'helloTest1';
    this.aboutCommon = new AboutCommon(
      props,
      dic => this.updateState(dic),
      FLAT_ABOUT.flag_user
    );
    this.state = {
      description: '',
    };
  }

  updateState(dic) {
    this.setState(dic);
  }

  onLogin(response) {
    if (response) {
      this.setState({
        description: response,
      });
    } else {
      this.setState({
        description: '',
      });
      const { state, goBack } = this.props.navigation;
      // use the callback function to load the user on
      // Account page when login failed
      goBack();
      state.params.loadUser();
    }
  }

  onLogout() {
    const { state, goBack } = this.props.navigation;
    goBack();
    state.params.logoutUser();
  }

  render() {
    let user = this.user;
    let content;
    if (user) {
      content = (
        <View style={[styles.row, { paddingTop: 10 }]}>
          <Button
            onPress={() => {
              userDAO.logout(() => this.onLogout());
            }}
            buttonStyle={styles.button}
            backgroundColor={this.props.theme.themeColor}
            title="Logout"
          />
        </View>
      );
    } else {
      content = (
        <View style={{ flex: 1 }}>
          <View style={GlobalStyles.line} />
          <View style={styles.row}>
            <TextInput
              style={styles.input}
              placeholder=" Please input your username"
              onChangeText={text => (this.username = text)}
            />
          </View>
          <View style={GlobalStyles.line} />
          <View style={[styles.row]}>
            <TextInput
              secureTextEntry={true}
              placeholder=" Please input your password"
              style={styles.input}
              onChangeText={text => (this.password = text)}
            />
          </View>
          <View style={GlobalStyles.line} />
          <View style={[styles.row, { paddingTop: 10 }]}>
            <Button
              onPress={() => {
                userDAO.logout(() => this.onLogout());
              }}
              buttonStyle={styles.button}
              backgroundColor={this.props.theme.themeColor}
              title="Logout"
            />
            <Button
              onPress={() => {
                userDAO.login(this.username, this.password, response =>
                  this.onLogin(response)
                );
              }}
              buttonStyle={styles.button}
              backgroundColor={this.props.theme.themeColor}
              title="Login"
            />
          </View>
        </View>
      );
    }

    return this.aboutCommon.render(content, {
      name: user ? user : 'Please login',
      description: this.state.description ? this.state.description : '',
      avatar: user ? this.avatar_url : null,
      backgroundImg: require('../../../res/avatar/user_background.jpg'),
    });
  }
}
