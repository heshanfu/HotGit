import React, { Component } from 'react';
import {
  View,
  DeviceEventEmitter,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Text,
  Alert,
} from 'react-native';
import ViewUtils from '../../util/ViewUtils';
import ComponentWithNavigationBar from '../../common/NavigatorBar';
import LanguageDAO, { FLAG_LANGUAGE } from '../../expand/dao/LanguageDAO';
import Checkbox from 'react-native-check-box';
import ArrayUtils from '../../util/ArrayUtils';
import GlobalStyles from '../../../res/styles/GlobalStyles';
import { ACTION_HOME, FLAG_TAB } from '../HomePage';
import { Icon } from 'react-native-elements';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  tips: {
    fontSize: 29,
  },
  line: {
    backgroundColor: 'darkgray',
    height: 1,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default class CustomKeyPage extends Component {
  constructor(props) {
    super(props);
    this.changeValues = [];
    const { state } = this.props.navigation;
    try {
      this.isRemoveKey = !!state.params.isRemoveKey;
    } catch (e) {
      this.isRemoveKey = false;
    }
    this.state = {
      dataArray: [],
    };
  }

  componentDidMount() {
    const { state } = this.props.navigation;
    this.flag = state.params.flag;
    this.languageDAO = new LanguageDAO(this.flag);
    this.loadData();
  }

  loadData() {
    this.languageDAO
      .fetch()
      .then(result => {
        this.setState({
          dataArray: result,
        });
        this.renderView();
      })
      .catch(error => {
        console.log(error);
      });
  }

  renderCheckBox(data) {
    let leftText = data.name;
    // let isChecked = this.isRemoveKey ? false : data.checked;
    let isChecked = data.checked;
    return (
      <View style={{ flex: 1, padding: 10 }}>
        <Checkbox
          leftText={leftText}
          onClick={() => this.onClick(data)}
          isChecked={isChecked}
          checkedImage={
            <Icon color={this.props.theme.themeColor} name="check-box" />
          }
          unCheckedImage={
            <Icon
              color={this.props.theme.themeColor}
              name="check-box-outline-blank"
            />
          }
        />
      </View>
    );
  }

  renderView() {
    if (!this.state.dataArray || this.state.dataArray.length === 0) return null;
    let len = this.state.dataArray.length;
    let views = [];
    for (let i = 0, l = len - 2; i < l; i += 2) {
      views.push(
        <View key={i}>
          <View style={styles.item}>
            {this.renderCheckBox(this.state.dataArray[i])}
            {this.renderCheckBox(this.state.dataArray[i + 1])}
          </View>
          <View style={styles.line} />
        </View>
      );
    }
    // deal with the rest keys
    views.push(
      <View key={len - 1}>
        <View style={styles.item}>
          {len % 2 === 0
            ? this.renderCheckBox(this.state.dataArray[len - 2])
            : null}
          {this.renderCheckBox(this.state.dataArray[len - 1])}
        </View>
        <View style={styles.line} />
      </View>
    );

    this.setState({
      selectionSection: views,
    });
  }

  onSave() {
    if (this.changeValues.length === 0) {
      this.props.navigation.goBack();
      return;
    }
    if (this.isRemoveKey) {
      for (let i = 0, l = this.changeValues.length; i < l; i++) {
        ArrayUtils.remove(this.state.dataArray, this.changeValues[i]);
      }
    }
    this.languageDAO.save(this.state.dataArray);
    const { state } = this.props.navigation;

    let jumpToTab =
      state.params.flag === FLAG_LANGUAGE.flag_key
        ? FLAG_TAB.flag_popularTab
        : FLAG_TAB.flag_trendingTab;
    DeviceEventEmitter.emit('ACTION_HOME', ACTION_HOME.A_RESTART, {
      jumpToTab: jumpToTab,
    });
  }

  onClick(data) {
    // if (!this.isRemoveKey) data.checked = !data.checked;
    data.checked = !data.checked;
    this.renderView();
    ArrayUtils.updateArray(this.changeValues, data);
  }

  onBack() {
    if (this.changeValues.length === 0) {
      this.props.navigation.goBack();
      return;
    }
    Alert.alert(
      'Note',
      'Do you want to save?',
      [
        { text: 'NO', onPress: () => this.props.navigation.goBack() },
        { text: 'YES', onPress: () => this.onSave() },
      ],
      { cancelable: false }
    );
  }

  render() {
    let title = this.isRemoveKey ? 'Remove Key' : 'Custom Key';
    title =
      this.flag === FLAG_LANGUAGE.flag_language ? 'Custom Language' : title;
    let rightButtonTitle = this.isRemoveKey ? 'Remove' : 'Save';
    let rightButton = (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        {!this.isRemoveKey ? (
          <TouchableOpacity
            onPress={() => {
              this.props.navigation.navigate('searchPage', {
                ...this.props,
              });
            }}
          >
            <Icon name="search" size={24} color="white" />
          </TouchableOpacity>
        ) : null}
        {ViewUtils.getRightButton(() => this.onBack(), rightButtonTitle)}
      </View>
    );

    let titleText = <Text style={GlobalStyles.titleText}>{title}</Text>;
    let leftButton = ViewUtils.getLeftButton(() => this.onBack());

    return (
      <View style={styles.container}>
        {ComponentWithNavigationBar(
          titleText,
          leftButton,
          rightButton,
          this.props.theme.themeColor
        )}
        <ScrollView>{this.state.selectionSection}</ScrollView>
      </View>
    );
  }
}
