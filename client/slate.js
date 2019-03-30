'use strict';

import React from 'react';
import {Editor} from 'slate-react';
import {Value} from 'slate';
import {isKeyHotkey} from 'is-hotkey';
import classNames from 'classnames';
import styles from './slate.css';

const isBoldHotkey = isKeyHotkey('mod+b')
const isItalicHotkey = isKeyHotkey('mod+i')
const isUnderlinedHotkey = isKeyHotkey('mod+u')
const isCodeHotkey = isKeyHotkey('mod+`')

// yeah.. this is just for prototyping
const USER_ID = Math.random().toString(36).substring(7);

class SyncingEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // initial value comes from props
      // which comes from HTTP endpoint
      value: Value.fromJSON(props.data.value),
      editorId: props.data.editorId
    };
    this.editor = React.createRef();
  }

  componentDidMount() {
    // set up websocket
    this.ws = new WebSocket(
      `ws://localhost:8081/${this.state.editorId}/${USER_ID}`
    );

    this.ws.onopen = () => { };
    this.ws.onclose = () => { };

    // recieved message
    this.ws.onmessage = (e) => {
      if (e.data) {
        const data = JSON.parse(e.data);
        // console.log('message:', data);
        if (data.event) {
          switch(data.event) {
            case 'OPERATIONS': {
              if (data.operations && data.operations.length > 0) {
                this.applyOperations(data.operations);
              }
            }
            case 'CONNECT': {
              return console.log(data.userId, 'connected');
            }
            case 'DISCONNECT': {
              return console.log(data.userId, 'disconnected');
            }
          }
        }
      }
    };

  }

  applyOperations = operations => {
    this.remote = true;
    operations.forEach(o => {
      this.editor.current.applyOperation(o);
    });
    // timeout is important here,
    // otherwise you'll get infinite loop
    // better ways to handle this? probably
    setTimeout(() => { this.remote = false; });
  }

  onChange = (change, options = {}) => {
    this.setState({value: change.value});

    if (!this.remote) {
      // turn immutable data
      // into plain JS data
      let operations = [];
      change.operations.forEach(op => {
        // do all the filtering here
        if (
          op.type !== 'set_selection' &&
          op.type !== 'set_value'
        ) {
          operations.push(op.toJS());
        }
      });

      if (operations.length > 0) {
        this.ws.send(JSON.stringify({
          editorId: this.state.editorId,
          userId: USER_ID,
          operations
        }));
      }
    }
  }


  render() {
    return (
      <div className={styles.wrapper}>
        <div className={styles.toolbar}>
          {this.renderMarkButton('bold', <b>B</b>)}
          {this.renderMarkButton('italic', <i>I</i>)}
          {this.renderMarkButton('underlined', <u>U</u>)}
          {this.renderMarkButton('code', <code>C</code>)}
        </div>

        <Editor
          ref={this.editor}
          className={styles.editor}
          placeholder="Enter some text.."
          value={this.state.value}
          onChange={this.onChange}
          onKeyDown={this.onKeyDown}
          renderMark={this.renderMark}
          spellCheck={false}
        />
      </div>
    );
  }


  // everything below is "mark" related
  // which is not related to collab in any way

  renderMark = (props, editor, next) => {
    const {children, mark, attributes} = props;

    switch (mark.type) {
      case 'bold':
        return <strong {...attributes}>{children}</strong>;
      case 'code':
        return <code {...attributes}>{children}</code>;
      case 'italic':
        return <em {...attributes}>{children}</em>;
      case 'underlined':
        return <u {...attributes}>{children}</u>;
      default:
        return next();
    }
  }

  renderMarkButton = (type, content) => {
    return (
      <button
        className={
          classNames({
            [styles.button]: true,
            [styles.active]: this.hasMark(type)
        })}
        onMouseDown={event => this.onClickMark(event, type)}
      >
        {content}
      </button>
    );
  }

  onKeyDown = (event, editor, next) => {
    let mark;

    if (isBoldHotkey(event)) {
      mark = 'bold';
    } else if (isItalicHotkey(event)) {
      mark = 'italic';
    } else if (isUnderlinedHotkey(event)) {
      mark = 'underlined';
    } else if (isCodeHotkey(event)) {
      mark = 'code';
    } else {
      return next();
    }

    event.preventDefault();
    editor.toggleMark(mark);
  }

  hasMark = (type) => {
    const {value} = this.state;
    return value.activeMarks.some(mark => mark.type === type);
  }

  onClickMark = (event, type) => {
    event.preventDefault();
    this.editor.current.toggleMark(type);
  }
}

export default SyncingEditor;
