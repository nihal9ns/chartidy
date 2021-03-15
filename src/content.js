// constants

const JANUARY = "Jan";
const FEBRUARY = "Feb";
const MARCH = "Mar";
const APRIL = "Apr";
const MAY = "May";
const JUNE = "Jun";
const JULY = "Jul";
const AUGUST = "Aug";
const SEPTEMBER = "Sep";
const OCTOBER = "Oct";
const NOVEMBER = "Nov";
const DECEMBER = "Dec";

// helpers

function monthStringToNumberMapper(monthString) {
  const mapper = {
    [JANUARY]: () => 01,
    [FEBRUARY]: () => 02,
    [MARCH]: () => 03,
    [APRIL]: () => 04,
    [MAY]: () => 05,
    [JUNE]: () => 06,
    [JULY]: () => 07,
    [AUGUST]: () => 08,
    [SEPTEMBER]: () => 09,
    [OCTOBER]: () => 10,
    [NOVEMBER]: () => 11,
    [DECEMBER]: () => 12,
  };

  const applyMapper = mapper[monthString];

  return applyMapper ? applyMapper() : null;
}

function transform(arr) {
  if (arr.length && arr[0].split("-").length === 3) {
    // date type
    arr.pop();

    return arr.map((elem) => {
      const splitString = elem.split("-");
      if (splitString.length === 3) {
        const day = splitString[0];
        const monthString = splitString[1];
        const year = splitString[2];

        const monthNumber = monthStringToNumberMapper(monthString);

        return `${year}-${monthNumber}-${day}`;
      }
    });
  }

  return arr.map((elem) => parseFloat(elem.replace(/,/g, "")));
}

function clearError() {
  document.getElementById("error-msg").innerHTML = "";
}

function setColumnHeader(columnHeader, axis) {
  return (document.getElementById(
    `${axis}-axis-column-header`
  ).innerHTML = columnHeader);
}

function getTable() {
  return document.getElementsByTagName("table")[0];
}

function getParent(element) {
  return element.parentElement;
}

function removeModal() {
  const modal = document.getElementById("modal");
  modal.remove();
}

function extractColumnHeader(table, axisColumnValue) {
  const rowLength = table.rows.length;

  let columnHeader = "";

  for (i = 0; i < rowLength; i++) {
    const cells = table.rows.item(i).cells;
    const cellLength = cells.length;

    for (let j = 0; j < cellLength; j++) {
      if (j == axisColumnValue - 1) {
        columnHeader = cells.item(j).innerText;
        return columnHeader;
      }
    }
  }

  return columnHeader;
}

// handlers

function cancelButtonOnClickHandler() {
  removeModal();
}

function isColumnIndexValid(axisColumnValue, headersLength) {
  if (
    axisColumnValue < 0 ||
    axisColumnValue > headersLength ||
    axisColumnValue == 0 ||
    axisColumnValue == ""
  ) {
    return false;
  }

  return true;
}

function validateColumnIndexes(
  xAxisColumnValue,
  yAxisColumnValue,
  headersLength
) {
  // validate column indexes

  const errorMessage = document.getElementById("error-msg");
  let error = false;
  let message = "";

  if (!isColumnIndexValid(xAxisColumnValue, headersLength)) {
    message = "- Invalid X-axis column";
    error = true;
  }

  if (!isColumnIndexValid(yAxisColumnValue, headersLength)) {
    message = message.concat(" - Invalid Y-axis column");
    error = true;
  }

  errorMessage.innerHTML = message;

  return { error };
}

function getXAndYValuesForChart(table, xAxisColumnValue, yAxisColumnValue) {
  // get X values and Y values to plot on chart

  const rowLength = table.rows.length;

  // check the header columns
  const headersLength = table.rows.item(0).cells.length;

  const { error } = validateColumnIndexes(
    xAxisColumnValue,
    yAxisColumnValue,
    headersLength
  );

  if (error) {
    return { error };
  }

  let xValues = [];
  let yValues = [];

  for (i = 0; i < rowLength; i++) {
    // gets cells of current row
    let cells = table.rows.item(i).cells;

    // gets amount of cells of current row
    let cellLength = cells.length;

    // loops through each cell in current row
    for (let j = 0; j < cellLength; j++) {
      if (j == xAxisColumnValue - 1) {
        let cellVal = cells.item(j).innerText;
        xValues.push(cellVal);
      }

      if (j == yAxisColumnValue - 1) {
        let cellVal = cells.item(j).innerText;
        yValues.push(cellVal);
      }
    }
  }

  return { xValues, yValues };
}

function createChartContainer(
  chartParentDiv,
  chartChildrenCount,
  xValues,
  yValues,
  xColumnHeader,
  yColumnHeader,
  chartType = "line"
) {
  // stack multiple charts on top of each other

  const chartId = `chartidy-${chartChildrenCount}`;

  let chartContainer = document.createElement("div");

  chartParentDiv.appendChild(chartContainer);

  let chartTitle = document.createElement("div");
  chartTitle.setAttribute("class", "chart-title");
  chartTitle.innerHTML = `${xColumnHeader} v/s ${yColumnHeader}`;
  chartContainer.appendChild(chartTitle);

  let chart = document.createElement("canvas");

  chart.setAttribute("id", chartId);
  chart.setAttribute("width", 800);
  chart.setAttribute("height", 400);
  chart.style.zIndex = 1;
  chartContainer.appendChild(chart);

  const ctx = document.getElementById(chartId).getContext("2d");

  new Chart(ctx, {
    type: chartType,
    data: {
      labels: xValues,
      datasets: [
        {
          label: yColumnHeader,
          data: yValues,
        },
      ],
      fill: false,
    },
    options: {},
  });
}

function plotChart(parentElement, xValues, yValues) {
  const xColumnHeader = xValues.shift();
  const yColumnHeader = yValues.shift();

  const xTransformedValues = transform(xValues);
  const yTransformedValues = transform(yValues);

  let chartChildrenCount = 0;

  const chartParentDivId = "chart-parent-div";

  if (document.getElementById(chartParentDivId)) {
    chartChildrenCount = document.getElementById(chartParentDivId)
      .childElementCount;

    createChartContainer(
      document.getElementById(chartParentDivId),
      chartChildrenCount,
      xTransformedValues,
      yTransformedValues,
      xColumnHeader,
      yColumnHeader
    );
  } else {
    let chartParentDiv = document.createElement("div");
    chartParentDiv.setAttribute("id", "chart-parent-div");
    parentElement.appendChild(chartParentDiv);

    createChartContainer(
      chartParentDiv,
      chartChildrenCount,
      xTransformedValues,
      yTransformedValues,
      xColumnHeader,
      yColumnHeader
    );
  }
}

function doneButtonOnClickHandler(table, parentElement) {
  // extract x-axis and y-axis column indexes

  const xAxisColumnValue = document.getElementById("x-axis-column").value;
  const yAxisColumnValue = document.getElementById("y-axis-column").value;

  const result = getXAndYValuesForChart(
    table,
    xAxisColumnValue,
    yAxisColumnValue
  );

  if (result.error) {
    return;
  }

  const { xValues, yValues } = result;

  // draw the chart
  plotChart(parentElement, xValues, yValues);

  removeModal();
}

function createModal(table, parentElement) {
  let modalBackground = document.createElement("div");
  modalBackground.setAttribute("id", "modal");
  modalBackground.setAttribute("class", "bg-modal");
  parentElement.appendChild(modalBackground);

  let modalContent = document.createElement("div");
  modalContent.setAttribute("class", "modal-content");
  modalBackground.appendChild(modalContent);

  let modalHeading = document.createElement("p");
  modalHeading.innerHTML =
    "Enter the column indexes to interpret in the visualization";

  modalContent.appendChild(modalHeading);

  let inputContainer = document.createElement("div");
  inputContainer.setAttribute("class", "input-container");
  modalContent.appendChild(inputContainer);

  let inputHeaderContainerX = document.createElement("div");
  inputHeaderContainerX.setAttribute("class", "input-header-container");

  let xAxisColumnInput = document.createElement("input");
  xAxisColumnInput.setAttribute("id", "x-axis-column");
  xAxisColumnInput.setAttribute("type", "text");
  xAxisColumnInput.setAttribute("placeholder", "X-axis");
  xAxisColumnInput.oninput = function (event) {
    // get column header in realtime
    const xColumnHeader = extractColumnHeader(table, event.target.value);

    if (xColumnHeader) {
      // display column header below x-axis input field
      setColumnHeader(xColumnHeader, "x");
    } else {
      setColumnHeader("Invalid column index", "x");
    }

    clearError();
  };

  let xAxisColumnHeader = document.createElement("span");
  xAxisColumnHeader.setAttribute("id", "x-axis-column-header");
  xAxisColumnHeader.setAttribute("class", "axis-column-header");
  xAxisColumnHeader.innerHTML = "";

  inputHeaderContainerX.appendChild(xAxisColumnInput);
  inputHeaderContainerX.appendChild(xAxisColumnHeader);

  let inputHeaderContainerY = document.createElement("div");
  inputHeaderContainerY.setAttribute("class", "input-header-container");

  let yAxisColumnInput = document.createElement("input");
  yAxisColumnInput.setAttribute("id", "y-axis-column");
  yAxisColumnInput.setAttribute("type", "text");
  yAxisColumnInput.setAttribute("placeholder", "Y-axis");
  yAxisColumnInput.oninput = function (event) {
    // get column header in realtime
    const yColumnHeader = extractColumnHeader(table, event.target.value);

    if (yColumnHeader) {
      // display column header below x-axis input field
      setColumnHeader(yColumnHeader, "y");
    } else {
      setColumnHeader("Invalid column index", "y");
    }

    clearError();
  };

  let yAxisColumnHeader = document.createElement("span");
  yAxisColumnHeader.setAttribute("id", "y-axis-column-header");
  yAxisColumnHeader.setAttribute("class", "axis-column-header");
  yAxisColumnHeader.innerHTML = "";

  inputHeaderContainerY.appendChild(yAxisColumnInput);
  inputHeaderContainerY.appendChild(yAxisColumnHeader);

  inputContainer.appendChild(inputHeaderContainerX);
  inputContainer.appendChild(inputHeaderContainerY);

  let errorContainer = document.createElement("div");
  errorContainer.setAttribute("class", "error-container");

  modalContent.appendChild(errorContainer);

  let errorMessage = document.createElement("span");
  errorMessage.setAttribute("id", "error-msg");
  errorContainer.appendChild(errorMessage);

  let buttonContainer = document.createElement("div");
  buttonContainer.setAttribute("class", "button-container");

  modalContent.appendChild(buttonContainer);

  let cancelButton = document.createElement("button");
  cancelButton.setAttribute("id", "cancel-btn");
  cancelButton.innerHTML = "CANCEL";
  cancelButton.onclick = () => {
    cancelButtonOnClickHandler();
  };

  buttonContainer.appendChild(cancelButton);

  let doneButton = document.createElement("button");
  doneButton.setAttribute("id", "done-btn");
  doneButton.innerHTML = "DONE";
  doneButton.onclick = () => {
    doneButtonOnClickHandler(table, parentElement);
  };

  buttonContainer.appendChild(doneButton);
}

function createVisualizeTextContainerOnClickHandler(table, parentElement) {
  // display modal to get X-axis and Y-axis values

  createModal(table, parentElement);

  document.querySelector(".bg-modal").style.display = "flex";
}

function createVisualizeTextContainer(table, parentElement) {
  // show visualize button

  let visualizeTextContainer = document.createElement("div");
  visualizeTextContainer.setAttribute("class", "visualize-container");

  let visualizeText = document.createElement("span");
  visualizeText.setAttribute("class", "visualize-text");
  visualizeText.innerHTML = "VISUALIZE";

  let chartidyText = document.createElement("span");
  chartidyText.setAttribute("class", "chartidy-text");
  chartidyText.innerHTML = "with Chartidy";

  visualizeTextContainer.appendChild(visualizeText);
  visualizeTextContainer.appendChild(chartidyText);

  visualizeTextContainer.onclick = function () {
    return createVisualizeTextContainerOnClickHandler(table, parentElement);
  };

  return visualizeTextContainer;
}

// main

window.onload = () => {
  const table = getTable();

  if (!table) {
    // do nothing
    return;
  }

  let parentElement = getParent(table);

  const visualizeTextContainer = createVisualizeTextContainer(
    table,
    parentElement
  );

  parentElement.insertBefore(visualizeTextContainer, parentElement.firstChild);
};
