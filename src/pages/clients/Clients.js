import React, { useState, useEffect } from "react";
import {
  Grid,
  LinearProgress,
  Button,
  Modal,
  Fade,
  Backdrop,
  Typography,
  Card,
  CardHeader,
  Avatar,
  CardContent,
  MenuItem,
  ButtonGroup
} from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import { Pages } from "@material-ui/icons";
import { purple, deepOrange } from "@material-ui/core/colors";
import MUIDataTable from "mui-datatables";
import axios from "axios";
import { Formik, Field, Form } from "formik";
import { TextField } from "formik-material-ui";
import * as Yup from "yup";
import { DatePicker } from "@material-ui/pickers";
import moment from "moment";

import { fetchDataIfNeeded } from "../../actions";

// components
import PageTitle from "../../components/PageTitle";

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`
  };
}

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1
  },
  paper: {
    position: "absolute",
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(4, 3),
    minWidth: "300px",
    maxWidth: "900px"
  },
  model: {
    top: "50%",
    left: "50%",
    transform: "translate(-50}%, -50%)"
  },
  button: {
    margin: theme.spacing(1)
  },
  card: {
    width: "350px",
    minWidth: "350px",
    margin: "auto"
  }
}));

const dataTableData = [];

export default function Clients() {
	// const [isLoading, setIsLoading] = useState(true);

	// useEffect(() => {
	// 	axios
	// 		.get("/clients/")
	// 		.then(res => {
	// 			res.data.map(item => {
	// 				var temp = [];

	// 				temp[0] = item.name;
	// 				temp[1] = item.email;
	// 				temp[2] = item.telephone;
	// 				temp[3] = item.address;

	// 				dataTableData.push(temp);
	// 			});
	// 			setIsLoading(false);
	// 		})
	// 		.catch(err => console.log(err));
	// }, []);

    const [open, setOpen] = useState(false);
    const [openUpdate, setOpenUpdate] = useState(false);
    const [updateValues, setUpdateValues] = useState({
      id_: "",
      name:"",
      email:"",
      telephone:"",
      address:""
    });
    const classes = useStyles();
    const [modalStyle] = useState(getModalStyle);
    const dispatch = useDispatch();

    const selectedMenuItem = useSelector(state => state.selectedMenuItem);

    useEffect(() => {
      selectedMenuItem !== "clients" &&
        dispatch({ type: "SELECT_MENU_ITEM", menuItem: "clients" });
    }, [selectedMenuItem, dispatch]);

    dispatch(fetchDataIfNeeded("clients"));

    const isLoading = useSelector(
      state => state.dataPerMenuItem.clients.isFetching
    );

    var data = useSelector(state => state.dataPerMenuItem.clients.content);

    if (!isLoading) {
      var dataTableData = [];
      var count = 0;

      data.map(item => {
        var temp = [];

        temp[0] = item.id_;
        temp[1] = item.name;
        temp[2] = item.email;
        temp[3] = item.telephone;
        temp[4] = item.address;

        count++;

        dataTableData.push(temp);
      });
    }

    const columns = [
      {
        name: "ID",
        options: {
          filter: false,
          sort: true
        }
      },
      {
        name: "Name",
        options: {
          filter: false,
          sort: true
        }
      },
      {
        name: "Email",
        options: {
          filter: false,
          sort: true
        }
      },
      {
        name: "Telephone",
        options: {
          filter: false,
          sort: true
        }
      },
      {
        name: "Address",
        options: {
          filter: false,
          sort: true
        }
      },
      {
        name: "Edit",
        options: {
          filter: false,
          sort: false,
          empty: true,
          customBodyRender: (value, tableMeta, updateValue) => {
            return (
              <>
                <ButtonGroup>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => {
                      axios({
                        method: "delete",
                        url: `/clients/${tableMeta.rowData[0]}`
                      })
                        .then(response => {
                          console.log(response);
                          if (response.status === 200) {
                            dispatch({
                              type: "INVALIDATE_MENU_ITEM",
                              menuItem: "clients"
                            });
                            dispatch(fetchDataIfNeeded("clients"));
                          }
                        })
                        .catch(error => {
                          console.log(error);
                        });
                    }}
                  >
                    Delete
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      console.log("tableMata", tableMeta.rowData);

                      const val = {
                        id_: tableMeta.rowData[0],
                        name: tableMeta.rowData[1],
                        email: tableMeta.rowData[2],
                        telephone: tableMeta.rowData[3],
                        address: tableMeta.rowData[4]
                      };

                      setUpdateValues(val);

                      console.log("values", updateValues);

                      setOpenUpdate(true);
                    }}
                  >
                    Edit
                  </Button>
                </ButtonGroup>
              </>
            );
          }
        }
      }
    ];

	return (
    <>
      <PageTitle title="Clients" />
      <Grid container spacing={4}>
        <Grid item xs={12}>
          {!isLoading && (
            <Card
              className={classes.card}
              style={{ backgroundColor: "#4fc3f7", borderRadius: "10px" }}
            >
              <CardHeader
                title="Total Client Count"
                titleTypographyProps={{
                  align: "center",
                  variant: "h2"
                }}
                style={{
                  color: "white"
                }}
                avatar={
                  <Avatar
                    style={{
                      margin: 10,
                      color: "#fff",
                      backgroundColor: "#76ff03"
                    }}
                  >
                    <Pages />
                  </Avatar>
                }
              ></CardHeader>
              <CardContent
                style={{
                  textAlign: "center"
                }}
              >
                <Typography
                  variant="h1"
                  component="span"
                  style={{
                    color: "white",
                    backgroundColor: "#4db6ac",
                    padding: "10px",
                    borderRadius: "10px"
                  }}
                >
                  {count}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
        <Grid item xs={12}>
          {!isLoading && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpen(true)}
            >
              Add
            </Button>
          )}
        </Grid>
        <Grid item xs={12}>
          {isLoading ? (
            <LinearProgress />
          ) : (
            <MUIDataTable
              title="Clients"
              data={dataTableData}
              columns={columns}
              options={{
                filterType: "checkbox"
              }}
            />
          )}
        </Grid>
      </Grid>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 200 }}
      >
        <Fade in={open}>
          <div style={modalStyle} className={classes.paper}>
            <Formik
              initialValues={{
                // id_: "",
                name: "",
                email: "",
                telephone: "",
                address: ""
              }}
              validationSchema={() => {
                return Yup.object({
                  name: Yup.string()
                    .max(100, "Must be 100 characters or less")
                    .trim()
                    .required("Required"),
                  email: Yup.string()
                    .email("Not a email")
                    .required("Required"),
                  telephone: Yup.number()
                    .min(10, "Must be a number greater than one")
                    .max(10, "Too big. Enter smaller value.")
                    .positive("Should be a positive number.")
                    .integer("Should be a integer.")
                    .required("Required"),
                  address: Yup.string()
                    .max(100, "Must be 100 characters or less")
                    .trim()
                    .required("Required")
                });
              }}
              onSubmit={(values, { setSubmitting }) => {
                console.log(values);
                axios({
                  method: "post",
                  url: "/clients/",
                  data: {
                    name: values.name,
                    email: values.email,
                    telephone: values.telephone,
                    address: values.address
                  }
                })
                  .then(response => {
                    console.log(response);
                    if (response.status === 200) {
                      setSubmitting(false);
                      setOpen(false);
                      dispatch({
                        type: "INVALIDATE_MENU_ITEM",
                        menuItem: "clients"
                      });
                      dispatch(fetchDataIfNeeded("clients"));
                    }
                  })
                  .catch(error => {
                    console.log(error);
                  });
              }}
              render={({ submitForm, isSubmitting }) => (
                <div>
                  <Typography
                    align="center"
                    color="textPrimary"
                    display="block"
                    gutterBottom={true}
                    variant="h1"
                  >
                    Add New Client
                  </Typography>
                  <Form>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Field
                          type="text"
                          label="Name"
                          name="name"
                          component={TextField}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Field
                          type="text"
                          label="Email"
                          name="email"
                          component={TextField}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Field
                          type="number"
                          label="Telephone"
                          name="telephone"
                          component={TextField}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Field
                          type="text"
                          label="Address"
                          name="address"
                          component={TextField}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          variant="contained"
                          color="primary"
                          disabled={isSubmitting}
                          onClick={submitForm}
                          className={classes.button}
                        >
                          Submit
                        </Button>
                        <Button
                          color="primary"
                          className={classes.button}
                          disabled={isSubmitting}
                          onClick={() => setOpen(false)}
                        >
                          Cancle
                        </Button>
                      </Grid>
                    </Grid>
                  </Form>
                </div>
              )}
            />
          </div>
        </Fade>
      </Modal>
      <Modal
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 200 }}
      >
        <Fade in={openUpdate}>
          <div style={modalStyle} className={classes.paper}>
            <Formik
              initialValues={{
                id_: updateValues.id_,
                name: updateValues.name,
                email: updateValues.email,
                telephone: updateValues.telephone,
                address: updateValues.address
              }}
              validationSchema={() => {
                return Yup.object({
                  name: Yup.string()
                    .max(100, "Must be 100 characters or less")
                    .trim()
                    .required("Required"),
                  email: Yup.string()
                    .email("Not a email")
                    .required("Required"),
                  telephone: Yup.number()
                    .min(10, "Must be a number greater than one")
                    .max(10, "Too big. Enter smaller value.")
                    .positive("Should be a positive number.")
                    .integer("Should be a integer.")
                    .required("Required"),
                  address: Yup.string()
                    .max(100, "Must be 100 characters or less")
                    .trim()
                    .required("Required")
                });
              }}
              onSubmit={(values, { setSubmitting }) => {
                console.log(values);
                axios({
                  method: "put",
                  url: "/clients/",
                  data: {
                    name: values.name,
                    email: values.email,
                    telephone: values.telephone,
                    address: values.address
                  }
                })
                  .then(response => {
                    console.log(response);
                    if (response.status === 200) {
                      setSubmitting(false);
                      setOpen(false);
                      dispatch({
                        type: "INVALIDATE_MENU_ITEM",
                        menuItem: "clients"
                      });
                      dispatch(fetchDataIfNeeded("clients"));
                    }
                  })
                  .catch(error => {
                    console.log(error);
                  });
              }}
              render={({ submitForm, isSubmitting }) => (
                <div>
                  <Typography
                    align="center"
                    color="textPrimary"
                    display="block"
                    gutterBottom={true}
                    variant="h1"
                  >
                    Update Client
                  </Typography>
                  <Form>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Field
                          type="text"
                          label="ID"
                          name="id_"
                          component={TextField}
                          fullWidth
                          disabled
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Field
                          type="text"
                          label="Name"
                          name="name"
                          component={TextField}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Field
                          type="text"
                          label="Email"
                          name="email"
                          component={TextField}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Field
                          type="number"
                          label="Telephone"
                          name="telephone"
                          component={TextField}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Field
                          type="text"
                          label="Address"
                          name="address"
                          component={TextField}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          variant="contained"
                          color="primary"
                          disabled={isSubmitting}
                          onClick={submitForm}
                          className={classes.button}
                        >
                          Submit
                        </Button>
                        <Button
                          color="primary"
                          className={classes.button}
                          disabled={isSubmitting}
                          onClick={() => setOpenUpdate(false)}
                        >
                          Cancle
                        </Button>
                      </Grid>
                    </Grid>
                  </Form>
                </div>
              )}
            />
          </div>
        </Fade>
      </Modal>
    </>
  );
}
