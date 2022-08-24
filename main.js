const edgeTag = `\``;
const skipText = `SKIP`;
const stopText = `STOP`;
const waitText = `WAIT`;
const retryText = `RETRY`;
const fontWhite = '#C5C5C5';

module.exports.requestGroupActions = [
  {
    label: 'Execute All Requests',
    action: async (context, data) => {
      try {
        await executeAllRequests(context, data);
      } catch {
        context.app.showGenericModalDialog("Error", { html: "Something went wrong. Please contact author." });
      }
    },
  }
];

async function executeAllRequests(context, data) {
  const { requests } = data;

  const retryMasterValue = getRetryValue(data?.requestGroup?.name || '');

  let results = [];
  results.push(getRowTemplate());
  let counter = 0;
  for (const request of requests) {

    const { firstTags, lastTags, actualName } = getComponentsByEdgeTag(request.name);
    try {

      let retryRequestValue = getRetryValue(request.name) || retryMasterValue || 0;
      retryRequestValue = +retryRequestValue;

      if (retryRequestValue < 0) retryRequestValue = 0;

      if (alreadyTagged(firstTags, stopText)) {
        console.log('Stopped.');
        break;
      }

      if (alreadyTagged(firstTags, skipText) || alreadyTagged(lastTags, skipText)) {
        console.log('Skipped.');
        continue;
      }

      if (alreadyTagged(firstTags, waitText)) {
        console.log('Waiting.');
        const tagValue = findTagValue(firstTags, waitText);
        results.push(constructTextRow(`Waiting for ${tagValue} seconds before running ${actualName.toUpperCase()}.`));
        await delay((+tagValue) * 1000);
      }

      // Condition <= will make sure that it will run for at least for once.
      for (let i = 0; i <= retryRequestValue; i++) {

        if (i !== 0) {
          results.push(constructTextRow(`Retry Attempt ${i} for request ${actualName.toUpperCase()}.`, true));
        }

        const response = await context.network.sendRequest(request);
        results.push(constructRequestRow(actualName, request, response));
  
        if ((response.statusCode || '').toString().startsWith('2')) {
          break;
        }
      }

      if (alreadyTagged(lastTags, stopText)) {
        console.log('Stopped.');
        break;
      }

      if (alreadyTagged(lastTags, waitText)) {
        console.log('Waiting.');
        const tagValue = findTagValue(lastTags, waitText);
        results.push(constructTextRow(`Waiting for ${tagValue} seconds after running ${actualName.toUpperCase()}.`));
        await delay((+tagValue) * 1000);
      }

    } catch {
      results.push(constructTextRow(`Failed to run ${actualName.toUpperCase()}, please check the request again.`, true));
      break;
    }
  }

  const css = getTableTemplate();
  const html = `<html><head><style>${css}</style></head><body ><table bgcolor="#282D35">${results.join('\n')}</table></body></html>`;

  context.app.showGenericModalDialog('REQUESTS EXECUTION SUMMARY', { html });
}

function getRetryValue(name) {
  const { firstTags, lastTags } = getComponentsByEdgeTag(name);

  let retryValue = 0;
  if (alreadyTagged(firstTags, retryText)) retryValue = findTagValue(firstTags, retryText);
  else if (alreadyTagged(lastTags, retryText)) retryValue = findTagValue(lastTags, retryText);

  return retryValue;
}

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

function getComponentsByEdgeTag(name) {

  let originalName = name;
  let actualName = originalName;

  const regex = /\`(.*?)\`/gi;
  const resultMatchGroup = actualName.match(regex);

  if (!resultMatchGroup) {
    return { firstTags: '', lastTags: '', actualName };
  }

  // If only 1 tag is found and it is present at last, then mark the firstTag as emptyString.
  if (resultMatchGroup.length === 1 && actualName.endsWith(edgeTag)) {
    resultMatchGroup.unshift('');
  }

  const desiredRes = resultMatchGroup.map(match => match.replace(regex, "$1"))

  resultMatchGroup.forEach(match => actualName = actualName.replace(match, ''));
  actualName = actualName.trim();

  return { firstTags: desiredRes[0] || '', lastTags: desiredRes[1] || '', actualName };
}

function alreadyTagged(tags = "", tagToFind) {
  tags = tags.toUpperCase();
  const splits = tags.split(',');
  const tagIndex = splits.findIndex(n => n.trim() === tagToFind);
  if (tagIndex >= 0) return true;

  // Wait can also have seconds associated. Determine it separately.
  if (tagToFind === waitText || tagToFind === retryText) {
    return tags.startsWith(tagToFind);
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

function constructTextRow(text, isError) {
  const style = isError ? "color: red; font-weight: bold;" : '';
  const row = `<tr><td id="td_right" style="${style}" colSpan=5>${text}</td></tr>`;
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
