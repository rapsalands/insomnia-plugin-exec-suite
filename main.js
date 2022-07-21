const edgeTag = `\``;
const skipText = `SKIP`;
const stopText = `STOP`;
const waitText = `WAIT`;
const fontWhite = '#C5C5C5';

module.exports.requestGroupActions = [
  {
    label: 'Execute Requests',
    action: async (context, data) => {
      const { requests } = data;

      let results = [];
      results.push(getRowTemplate());
      for (const request of requests) {

        const { tags, actualName } = getComponentsByEdgeTag(request);
        if(alreadyTagged(tags, stopText)) {
          console.log('Stopped.');
          break;
        }
        if(alreadyTagged(tags, skipText)) {
          console.log('Skipped.');
          continue;
        }
        if(alreadyTagged(tags, waitText)) {
          console.log('Waiting.');
          const tagValue = findTagValue(tags, waitText);
          results.push(constructTextRow(`Waiting for ${tagValue} seconds before running ${actualName}.`));
          await delay((+tagValue) * 1000);
        }

        const response = await context.network.sendRequest(request);
        const rowStr = constructRequestRow(actualName, request, response);
        results.push(rowStr);
      }

      const css = getTableTemplate();
      const html = `<html><head><style>${css}</style></head><body ><table bgcolor="#282D35">${results.join('\n')}</table></body></html>`;

      context.app.showGenericModalDialog('Results', { html });
    },
  }
];

function getRowTemplate() {
  return (
    `<tr>
      <th id="td_right" style="color: ${fontWhite}">Method</th>
      <th id="td_right" style="color: ${fontWhite}">Request</th>
      <th id="td_right" style="color: ${fontWhite}">Status</th>
      <th id="td_right" style="color: ${fontWhite}">Time</th>
      <th id="td_right" style="color: ${fontWhite}">Bytes</th>
    </tr>`
  );
}

const delay = ms => new Promise(res => setTimeout(res, ms));

function getTableTemplate() {
  return (
    `table { width: 100% !important; margin: 0 auto 0 auto; }
      td { border: 1px solid #4B505C; color: ${fontWhite};}
      th, .label--small, label > small { text-align: left; padding: 10px 10px 10px 15px !important; padding-bottom: none !important; font-size: 15px !important; border: 1px solid ${fontWhite}; }
      td { border: 1px solid #4B505C; color: ${fontWhite};}
      #td_left { text-align: left; padding: 3px 40px 3px 10px; color: ${fontWhite}; }
      #td_right { text-align: center; padding: 3px 3px 3px 3px; color: ${fontWhite}; }`
  );
}

function getComponentsByEdgeTag(request) {
  let originalName = request.name;
  let splits = originalName.split(edgeTag);

  if(splits.length < 3) {
    originalName = `${edgeTag}${edgeTag}${originalName}`;
    splits = originalName.split(edgeTag);
  }

  let tags = splits[1], actualName = splits[2];
  return {tags, actualName};
}

function alreadyTagged(tags = "", tagToFind) {
  tags = tags.toUpperCase();
  const splits = tags.split(',');
  const tagIndex = splits.findIndex(n => n.trim() === tagToFind);
  if(tagIndex >= 0) return true;

  // Wait can also have seconds associated. Determine it separately.
  if(tagToFind === waitText) {
    return tags.startsWith(waitText);
  }

  return false;
}

// We assume here that tag must be present. Hence, alreadyTagged function must be called before calling this.
function findTagValue(tags, tagToFind) {
  tags = tags.toUpperCase();
  const splits = tags.split(',');
  const tagIndex = splits.findIndex(n => n.trim().startsWith(tagToFind));

  const tag = splits[tagIndex];
  return tag.substring(tagToFind.length + 1, tag.length - 1)
}

function constructRequestRow(requestName, request, response) {
  var stateCodeColor = getStatusCodeColor(response.statusCode);
  var methodColor = getMethodColor(request.method);
  var time = millisecToHumanReadable(response.elapsedTime);
  const row = `<tr>
                  <td id="td_right"><font color="${methodColor}">${request.method}</font></td>
                  <td id="td_left">${requestName}</td>
                  <td id="td_right"><font color="${stateCodeColor}">${response.statusCode} ${response.statusMessage}</font></td>
                  <td id="td_right">${time}</td>
                  <td id="td_right">${response.bytesRead}</td>
                </tr>`;
  return row;
}

function constructTextRow(text) {
  const row = `<tr><td id="td_right" colSpan=5>${text}</td></tr>`;
  return row;
}

function getStatusCodeColor(statusCode) {
  if (statusCode.toString().startsWith("2")) {
    return "#8AB46C";
  } else if (statusCode.toString().startsWith("4")) {
    return "#D19A66";
  } else if (statusCode.toString().startsWith("5")) {
    return "#D8696F";
  }
}

function getMethodColor(method) {
  if (method.toString().startsWith("GET")) {
    return "#8AB46C";
  } else if (method.toString().startsWith("POST")) {
    return "#2596BE";
  } else if (method.toString().startsWith("PUT")) {
    return "#D19A66";
  } else if (method.toString().startsWith("DELETE")) {
    return "#D8696F";
  } else {
    return "#FFFFFF";
  }
}

function millisecToHumanReadable(millisec) {
  var seconds = (millisec / 1000).toFixed(2);

  if (millisec < 1000) {
    return millisec.toFixed(0) + " ms";
  } else if (seconds < 60) {
    return seconds + " s";
  }
}
