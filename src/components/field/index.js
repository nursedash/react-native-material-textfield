import React, { PropTypes, Component } from 'react';
import { TextInput, View, Animated, Easing, TouchableWithoutFeedback, StyleSheet } from 'react-native';

import Label from '../label';
import Helper from '../helper';
import styles from './styles.js';

export default class TextField extends Component {
  static defaultProps = {
    underlineColorAndroid: 'transparent',
    disableFullscreenUI: true,
    autoCapitalize: 'sentences',
    editable: true,

    animationDuration: 225,

    tintColor: 'rgb(0, 145, 234)',
    textColor: 'rgba(0, 0, 0, .87)',
    baseColor: 'rgba(0, 0, 0, .38)',

    errorColor: 'rgb(213, 0, 0)',

    disabled: false,
  };

  static propTypes = {
    ...TextInput.propTypes,

    animationDuration: PropTypes.number,

    tintColor: PropTypes.string,
    textColor: PropTypes.string,
    baseColor: PropTypes.string,

    label: PropTypes.string.isRequired,
    title: PropTypes.string,

    error: PropTypes.string,
    errorColor: PropTypes.string,

    disabled: PropTypes.bool,
  };

  constructor(props) {
    super(props);

    this.onBlur = this.onBlur.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onChangeText = this.onChangeText.bind(this);
    this.onPress = this.focus.bind(this);

    this.state = {
      text: props.value,
      error: props.error,
      focus: new Animated.Value(props.error? -1 : 0),
      focused: false,
    };
  }

  componentWillReceiveProps(props) {
    let { text, error } = this.state;

    if (props.value !== text) {
      this.setState({ text: props.value });
    }

    if (props.error && props.error !== error) {
      this.setState({ error: props.error });
    }
  }

  componentWillUpdate(props, state) {
    let { error } = this.props;
    let { focus, focused } = this.state;

    if (props.error !== error || focused ^ state.focused) {
      Animated.timing(focus, {
        toValue: props.error? -1 : (state.focused? 1 : 0),
        duration: props.animationDuration,
        easing: Easing.inOut(Easing.ease),
      }).start(() => {
        this.setState((state, { error }) => ({ error }));
      });
    }
  }

  focus() {
    let { disabled, editable } = this.props;

    if (!disabled && editable) {
      this.refs.input.focus();
    }
  }

  blur() {
    this.refs.input.blur();
  }

  clear() {
    this.refs.input.clear();
  }

  value() {
    return this.state.text;
  }

  isFocused() {
    return this.refs.input.isFocused();
  }

  onFocus() {
    let { onFocus } = this.props;

    if (typeof onFocus === 'function') {
      onFocus();
    }

    this.setState({ focused: true });
  }

  onBlur() {
    let { onBlur } = this.props;

    if (typeof onBlur === 'function') {
      onBlur();
    }

    this.setState({ focused: false });
  }

  onChangeText(text) {
    let { onChangeText } = this.props;

    if (typeof onChangeText === 'function') {
      onChangeText(text);
    }

    this.setState({ text });
  }

  render() {
    let { style, error: errorProp, editable, disabled, animationDuration, label, title, tintColor, baseColor, textColor, errorColor, ...props } = this.props;
    let { focused, focus, text, error } = this.state;

    let active = !!text;
    let errored = !!errorProp;

    let borderBottomColor = focus.interpolate({
      inputRange: [-1, 0, 1],
      outputRange: [errorColor, baseColor, tintColor],
    });

    let borderBottomWidth = focus.interpolate({
      inputRange: [-1, 0, 1],
      outputRange: [2, StyleSheet.hairlineWidth, 2],
    });

    let containerStyle = {
      ...(disabled?
        { overflow: 'hidden' }:
        { borderBottomColor, borderBottomWidth }
      )
    };

    let borderStyle = {
      borderColor: baseColor,
    };

    let inputStyle = {
      color: disabled? baseColor : textColor,
    };

    let errorStyle = {
      color: errorColor,

      opacity: focus.interpolate({
        inputRange: [-1, 0, 1],
        outputRange: [1, 0, 0],
      }),

      fontSize: title?
        12:
        focus.interpolate({
          inputRange:  [-1, 0, 1],
          outputRange: [12, 0, 0],
        }),
    };

    let titleStyle = {
      color: baseColor,

      opacity: focus.interpolate({
        inputRange: [-1, 0, 1],
        outputRange: [0, 1, 1],
      }),

      fontSize: 12,
    };

    let helperContainerStyle = {
      height: title?
        24:
        focus.interpolate({
          inputRange:  [-1, 0, 1],
          outputRange: [24, 8, 8],
        }),
    };

    return (
      <TouchableWithoutFeedback onPress={this.onPress}>
        <View>
          <Animated.View style={[styles.container, containerStyle]}>
            {disabled && <View style={[styles.border, borderStyle]} pointerEvents='none' />}

            <Label {...{ tintColor, baseColor, errorColor, animationDuration, focused, errored, active }}>
              {label}
            </Label>

            <TextInput
              style={[styles.input, inputStyle]}
              selectionColor={tintColor}

              {...props}

              editable={!disabled && editable}
              onChangeText={this.onChangeText}
              onFocus={this.onFocus}
              onBlur={this.onBlur}
              value={text}
              ref='input'
            />
          </Animated.View>

          <Animated.View style={helperContainerStyle}>
            {error && <Helper style={errorStyle} text={error} />}
            {title && <Helper style={titleStyle} text={title} />}
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    );
  }
}
