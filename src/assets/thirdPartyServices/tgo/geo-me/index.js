import React from "react";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
//import TextField from "@material-ui/core/TextField";
//import Typography from "@material-ui/core/Typography";
import OutlinedTextArea from "../../common/OutlinedTextArea";
import OutlinedDropDown from "../../common/OutlinedDropdown";
import { ServiceDefinition } from "./geo-me_pb_service";

var geo_me_pb = require("./geo-me_pb");

export default class GeoMeService extends React.Component {
  constructor(props) {
    super(props);
    this.canBeInvoked = this.canBeInvoked.bind(this);
    this.hasKml = this.hasKml.bind(this);
    this.submitAction = this.submitAction.bind(this);
    this.handleParameterChange = this.handleParameterChange.bind(this);
    this.handleInputText = this.handleInputText.bind(this);
    this.downloadKmlFile = this.downloadKmlFile.bind(this);

    this.textInput = React.createRef();

    this.state = {
      userguide: "https://github.com/tgotech/geo-me-doco/blob/main/userguide.md",
      test_simulator: "https://github.com/tgotech/geo_me_simulator",
      serviceName: "GeoMe",
      methodName: "geoFixMe",
      selectedExample: "0",
        exampleList: [
          {label: "Custom Input", value: "0", content: "",},
          {label: "Example - Fiji", value: "1", content: "https://raw.githubusercontent.com/tgotech/geo-me-doco/master/examples/example_input_fiji.json",},
          {label: "Example - Fiji2", value: "2", content: "https://raw.githubusercontent.com/tgotech/geo-me-doco/master/examples/example_input_fiji2.json",},
          {label: "Example - Fiji3", value: "3", content: "https://raw.githubusercontent.com/tgotech/geo-me-doco/master/examples/example_input_fiji3.json",},
          {label: "Example - Fiji4", value: "4", content: "https://raw.githubusercontent.com/tgotech/geo-me-doco/master/examples/example_input_fiji4.json",},
          {label: "Example - London", value: "5", content: "https://raw.githubusercontent.com/tgotech/geo-me-doco/master/examples/example_input_london.json",},
          {label: "Example - London2", value: "6", content: "https://raw.githubusercontent.com/tgotech/geo-me-doco/master/examples/example_input_london2.json",},
          {label: "Example - London3", value: "7", content: "https://raw.githubusercontent.com/tgotech/geo-me-doco/master/examples/example_input_london3.json",},
          {label: "Example - London4", value: "8", content: "https://raw.githubusercontent.com/tgotech/geo-me-doco/master/examples/example_input_london4.json",},
          {label: "Example - Buenos Aires", value: "9", content: "https://raw.githubusercontent.com/tgotech/geo-me-doco/master/examples/example_input_buenosaires.json",},
          {label: "Example - Buenos Aires2", value: "10", content: "https://raw.githubusercontent.com/tgotech/geo-me-doco/master/examples/example_input_buenosaires2.json",},
          {label: "Example - Buenos Aires3", value: "11", content: "https://raw.githubusercontent.com/tgotech/geo-me-doco/master/examples/example_input_buenosaires3.json",},
          {label: "Example - Buenos Aires4", value: "12", content: "https://raw.githubusercontent.com/tgotech/geo-me-doco/master/examples/example_input_buenosaires4.json",},
          {label: "Example - Fiji [Inconsistent Data]", value: "13", content: "https://raw.githubusercontent.com/tgotech/geo-me-doco/master/examples/example_input_fiji_inconsistent.json",},
        ],
        input: "",
    };
  }

  submitAction() {
    const methodDescriptor = ServiceDefinition.geoFixMe;
    const request = new methodDescriptor.requestType();
    var json_data = JSON.parse(this.state.input);

    var tgt = new geo_me_pb.Target();
    tgt.setId(json_data.target.id);
    tgt.setName(json_data.target.name);
    request.setTarget(tgt);

    json_data.observation.forEach(function(element) {
        var obs = new geo_me_pb.Observation();
        obs.setId(element.id);
        obs.setLat(element.lat);
        obs.setLon(element.lon);
        obs.setAssetid(element.assetId);
        obs.setMeas(element.meas);
        obs.setType(element.type);
        request.addObservation(obs);
    });

    request.setProvideKmlOut(json_data.provide_kml_out);

    const props = {
      request,
      onEnd: response => {
        const { message, status, statusMessage } = response;
        if (status !== 0) {
          throw new Error(statusMessage);
        }
        this.setState({
          response: {   lat: message.getLat(),
                        lon: message.getLon(),
                        elp_long: message.getElpLong(),
                        elp_short: message.getElpShort(),
                        elp_rot: message.getElpRot(),
                        residual: message.getResidual(),
                        status_svc: message.getStatus(),
                     }
        });
        if (message.getStatusmessage()!=="") {
            this.setState({
                  response: {
                                ...this.state.response,
                                statusMessage_svc: message.getStatusmessage()
                             }
            });
//                this.state.response = {
//                    ...this.state.response,
//                    statusMessage_svc: message.getStatusmessage()
//                }
        }
        if (message.getKmlOutput()!=="") {
            this.setState({
                  response: {
                                ...this.state.response,
                                kml_output: message.getKmlOutput()
                             }
            });
//                this.state.response = {
//                    ...this.state.response,
//                    kml_output: message.getKmlOutput()
//                }
        }
        console.log(this.state.response);
      },
    };

    this.props.serviceClient.unary(methodDescriptor, props);
  }

    handleParameterChange(event) {
      this.setState({
        selectedExample: event.target.value,
      }, () => {
        if (this.state.selectedExample !== "default") {
          this.state.exampleList.forEach(item => {
            if (item.value === event.target.value && event.target.value !== 0) {
              fetch(this.state.exampleList[event.target.value].content)
                 .then(res => res.json())
                 .then((data) => {
                      this.setState({ input: JSON.stringify(data, null, "\t") }, () => {
                          this.textInput.current.inputRef.current.focus();
                        },
                      );
               })
               .catch(err => { throw err });
            }
            if (event.target.value === "0") {
              this.setState({ input: "" }, () => {
                  this.textInput.current.inputRef.current.focus();
                },
              );
            }
          });
        }
      });
    }

 handleInputText(event) {
    this.setState({ [event.target.name]: event.target.value });
 }

  canBeInvoked() {
    if (!this.state.input) return false;
    return true;
  }

   hasKml() {
     if (!this.state.response.kml_output) return false;
     return true;
   }

  downloadKmlFile() {
    const element = document.createElement("a");
    const file = new Blob([this.state.response.kml_output], {type: 'application/vnd.google-earth.kml+xml'});
    element.href = URL.createObjectURL(file);
    element.download = "geo-me-output_"+(new Date()).getTime()+".kml";
    document.body.appendChild(element);
    element.click();
  }

  render() {
  return (
      <div style={{ flexGrow: 1 , width: "100%"}}>
        <Grid container direction="row" justify="center" alignItems="center" style={{ marginTop: 15, marginBottom: 15 }}>
          {
          <React.Fragment>
              <Grid item xs={12} style={{ textAlign: "left" }}>
                      <h5 style={{ marginBottom: "10px" }}>
                        <p>
                              A valid input should be in the JSON format, contain a target name and Id and at least two observations.
                              A result will only be computed for observations which are generally agreeable in their location estimation.
                              In other words, poor observations will likely result in an inaccurate or invalid result.
                        </p>
                          <p>See the <a href={this.state.userguide} style={{ fontSize: 15 }}>
                            User Guide
                          </a> for detailed explanations and an example data simulator, or use an example from the list below.</p>
                      </h5>
                <OutlinedDropDown
                  id="params"
                  name="selected_example"
                  label="Input Examples"
                  helperTxt="Select an example"
                  fullWidth={false}
                  list={this.state.exampleList}
                  value={this.state.selectedExample}
                  onChange={this.handleParameterChange}
                  htmlTooltip={
                  <React.Fragment>
                    <div style={{ fontSize: "15px" }}>
                      <p>Custom: This option allows custom input</p>
                      <p>Example - Fiji: Geolocation scenario in the Fiji area</p>
                      <p>Example - London: Geolocation scenario in the London area</p>
                      <p>Example - Buenos Aires: Geolocation scenario in the Buenos Aires area</p>
                      <p>*2 designates a relatively sparse observations set.</p>
                      <p>*3 designates a relatively abundant observations set.</p>
                      <p>*4 designates a a relatively erroneous observations set.</p>
                      <p>An example data simulator is linked in the User Guide which allows further custom example scenarios to be generated</p>
                    </div>
                   </React.Fragment>
                  }
                />
              </Grid>
              <Grid item xs={12} style={{ textAlign: "left" }}>
                <OutlinedTextArea
                  id="input_text"
                  ref={this.textInput}
                  name="input"
                  label="Input Data"
                  value={this.state.input}
                  helperTxt={"[PREVIEW]: " + this.state.input + " / 25000 char "}
                  rows={25}
                  charLimit={25000}
                  onChange={this.handleInputText}
                  htmlTooltip={
                    <div style={{ fontSize: "15px" }}>
                        <p>Enter custom JSON input</p>
                    </div>
                  }
                />
              </Grid>

              {!this.props.isComplete && (
                  <Grid item xs={12} style={{ textAlign: "center", marginTop: "10px", marginBottom: "10px" }}>
                      <Button style={{ fontSize: 15 }} size="large" variant="contained" color="primary" onClick={this.submitAction} disabled={!this.canBeInvoked()} title="Press to call the service">
                        Invoke
                      </Button>
                  </Grid>
              )}

              {this.props.isComplete && (
                <React.Fragment>
                  <Grid item xs={12} container style={{ textAlign: "left", width: "100%"}}>
                    <OutlinedTextArea
                      id="response_text"
                      name="response_text"
                      label="Location Estimate"
                      type="text"
                      fullWidth={true}
                      value={JSON.stringify(this.state.response, null, "\t")}
                      rows={20}
                      htmlTooltip={
                        <div style={{ fontSize: "15px" }}>
                            <p>Raw machine readable output</p>
                        </div>
                      }
                    />
                  </Grid>
                  <div>
                    <Button style={{ fontSize: 15 }} size="large" variant="contained" color="secondary" onClick={this.downloadKmlFile} disabled={!this.hasKml()} title={!this.hasKml() ? "No Kml" : "Press to Download a KML Map Layer"}>
                      Download Kml Output
                    </Button>
                  </div>
                 </React.Fragment>
              )}
            </React.Fragment>
          }
        </Grid>
      </div>
    );
  }
}
