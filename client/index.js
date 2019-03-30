'use strict';

import React, {useState, useEffect} from 'react';
import ReactDOM from 'react-dom';
import SyncingEditor from './slate';

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // fetch initial value
    fetch(`http://localhost:8080${window.location.pathname}`)
      .then((res) => {
        // console.log(res);
        return res.json();
      })
      .then((json) => {
        // console.log(json);
        if (json.editorId) {
          setData(json);
        }
      });
  }, []);

  if (!data) return <h1>Loading..</h1>;

  return (
    <SyncingEditor data={data} />
  );
}

ReactDOM.render(
  <App />,
  document.getElementById('app')
);
