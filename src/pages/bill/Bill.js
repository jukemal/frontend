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
  ButtonGroup,
  Box
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

import { fetchDataIfNeeded, setNotificationIfNeeded } from "../../actions";

// components
import PageTitle from "../../components/PageTitle";
import Report from "./Report";

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

export default function Bill() {
  const [open, setOpen] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [updateValues, setUpdateValues] = useState({
    id_: "",
    cashier: "",
    client: "",
    amount: "",
    date: "",
    paid: ""
  });
  const classes = useStyles();
  const [modalStyle] = useState(getModalStyle);
  const dispatch = useDispatch();

  var bill_id = 0;

  const selectedMenuItem = useSelector(state => state.selectedMenuItem);

  useEffect(() => {
    selectedMenuItem !== "bills" &&
      dispatch({ type: "SELECT_MENU_ITEM", menuItem: "bills" });
  }, [selectedMenuItem, dispatch]);

  dispatch(fetchDataIfNeeded("bills"));

  const isLoading = useSelector(
    state => state.dataPerMenuItem.bills.isFetching
  );

  var data = useSelector(state => state.dataPerMenuItem.bills.content.data);

  var notificationData=[]

  if (!isLoading) {
    var dataTableData = [];
    var count = 0;

    data.map(item => {
      var temp = [];

      temp[0] = item.id_;
      temp[1] = item.client_name;
      temp[2] = item.amount;
      temp[3] = moment(item.date).format("YYYY/MM/DD");
      temp[4] = item.paid ? "Paid" : "Pending";
      temp[5] = item.cashier;

      count++;

      dataTableData.push(temp);

      var a = moment(item.date);
      var b=moment(new Date())

      if (a.diff(b, "days") < 30 && notificationData.find((i)=>{
          return i.id_===item.id_
      })===undefined) {
        notificationData.push(item);
      }
    });
  }

  dispatch(fetchDataIfNeeded("clients"));

  var clientData = useSelector(state => state.dataPerMenuItem.clients.content);

  const columns = [
    {
      name: "Bill Number",
      options: {
        filter: false,
        sort: true
      }
    },
    {
      name: "Client Name",
      options: {
        filter: true,
        sort: true
      }
    },
    {
      name: "Amount",
      options: {
        filter: false,
        sort: true
      }
    },
    {
      name: "Date",
      options: {
        filter: false,
        sort: true
      }
    },
    {
      name: "Paid",
      options: {
        filter: false,
        sort: true
      }
    },
    {
      name: "Cashier",
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
                      url: `/bills/${tableMeta.rowData[0]}`
                    })
                      .then(response => {
                        console.log(response);
                        if (response.status === 200) {
                          dispatch({
                            type: "INVALIDATE_MENU_ITEM",
                            menuItem: "bills"
                          });
                          dispatch(fetchDataIfNeeded("bills"));
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

                    bill_id = tableMeta.rowData[0];
                    console.log("id_", bill_id);

                    let cl = clientData.find(i => {
                      return i.name === tableMeta.rowData[1];
                    });

                    const val = {
                      id_: tableMeta.rowData[0],
                      cashier: tableMeta.rowData[5],
                      client: cl.id_,
                      amount: tableMeta.rowData[2],
                      date: moment(tableMeta.rowData[3]).format("YYYY/MM/DD"),
                      paid: tableMeta.rowData[4].toLowerCase()
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
      <PageTitle title="Bills" />
      <Grid container spacing={4}>
        {!isLoading && (
          <Grid item xs={12}>
            {notificationData.map((i)=> (<Box
                key={i.id_}
              style={{
                margin: "5px 0",
                backgroundColor: "#ffd740",
                padding: "10px",
                borderRadius: "10px"
              }}
            >
              <Grid container item xs={12}>
                <Grid item xs={11}>
                  <Typography
                    align="center"
                    color="textSecondary"
                    variant="h5"
                    display="block"
                  >
                     {`Bill number ${i.id_} has less than month till Due Date`}
                  </Typography>
                </Grid>
                <Grid item xs={1}>
                  <Typography
                    align="right"
                    color="textSecondary"
                    display="block"
                    variant="h5"
                    style={{
                      margin: "0px 10px",
                      padding: "3px"
                    }}
                  >
                    X
                  </Typography>
                </Grid>
              </Grid>
            </Box>))}
          </Grid>
        )}
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
              title="Bills"
              data={dataTableData}
              columns={columns}
              options={{
                filterType: "checkbox"
              }}
            />
          )}
        </Grid>
        {!isLoading && (
          <Grid
            container
            item
            xs={12}
            spacing={1}
            alignContent="space-around"
            alignItems="center"
            justify="center"
          >
            <>
              <Grid item lg={6}>
                <Card
                  className={classes.card}
                  style={{ backgroundColor: "#4fc3f7", borderRadius: "10px" }}
                >
                  <CardHeader
                    title="Total Item Count"
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
              </Grid>
            </>
          </Grid>
        )}
        <Grid item xs={12}>
          {!isLoading && (
            <>
              <Card raised={true}>
                <CardHeader
                  title="Bills Entered by Date"
                  titleTypographyProps={{
                    align: "center",
                    variant: "h2"
                  }}
                />
                <CardContent>
                  <Report />
                </CardContent>
              </Card>
            </>
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
                cashier: "",
                client: "",
                amount: "",
                // date_added: new Date(),
                date_added: "",
                paid: ""
              }}
              validationSchema={() => {
                return Yup.object({
                  cashier: Yup.string()
                    .max(100, "Must be 100 characters or less")
                    .trim()
                    .lowercase()
                    .required("Required"),
                  amount: Yup.number()
                    .min(1, "Must be a number greater than one")
                    .max(1000000, "Too big. Enter smaller value.")
                    .positive("Should be a positive number.")
                    .integer("Should be a integer.")
                    .required("Required"),
                  date_added: Yup.date()
                    .min("2000/01/01")
                    .required("Required"),
                  paid: Yup.mixed().required("Please selece a value"),
                  client: Yup.mixed().required("Please selece a value")
                });
              }}
              onSubmit={(values, { setSubmitting }) => {
                console.log(values);
                axios({
                  method: "post",
                  url: "/bills/",
                  data: {
                    cashier: values.cashier,
                    client: values.client,
                    amount: values.amount,
                    paid: values.paid,
                    date: moment(values.date_added).format("YYYY/MM/DD")
                  }
                })
                  .then(response => {
                    console.log(response);
                    if (response.status === 200) {
                      setSubmitting(false);
                      setOpen(false);
                      dispatch({
                        type: "INVALIDATE_MENU_ITEM",
                        menuItem: "bills"
                      });
                      dispatch(fetchDataIfNeeded("bills"));
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
                    Add New Bill
                  </Typography>
                  <Form>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Field
                          type="text"
                          name="client"
                          label="Client"
                          select
                          variant="standard"
                          helperText="Please select Range"
                          margin="normal"
                          fullWidth
                          component={TextField}
                        >
                          {clientData.map(data => (
                            <MenuItem key={data.id_} value={data.id_}>
                              {data.name}
                            </MenuItem>
                          ))}
                        </Field>
                      </Grid>
                      <Grid item xs={12}>
                        <Field
                          type="number"
                          label="Amount"
                          name="amount"
                          component={TextField}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Field
                          label="Date"
                          name="date_added"
                          fullWidth
                          component={({ field, form, ...other }) => {
                            return (
                              <DatePicker
                                clearable
                                name={field.name}
                                value={field.value}
                                openTo="year"
                                format="YYYY/MM/DD"
                                views={["year", "month", "date"]}
                                onChange={date =>
                                  form.setFieldValue(field.name, date, false)
                                }
                                {...other}
                              />
                            );
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Field
                          type="text"
                          name="paid"
                          label="Paid"
                          select
                          variant="standard"
                          margin="normal"
                          fullWidth
                          component={TextField}
                        >
                          <MenuItem key="1" value="paid">
                            Pending
                          </MenuItem>
                          <MenuItem key="2" value="pending">
                            Paid
                          </MenuItem>
                        </Field>
                      </Grid>
                      <Grid item xs={12}>
                        <Field
                          type="text"
                          label="Cashier"
                          name="cashier"
                          component={TextField}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12}>
                        {isSubmitting && <LinearProgress />}
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

      {/* Edit model */}
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
                cashier: updateValues.cashier,
                client: updateValues.client,
                amount: updateValues.amount,
                date: moment(updateValues.date).format("YYYY/MM/DD"),
                paid: updateValues.paid
              }}
              validationSchema={() => {
                return Yup.object({
                  cashier: Yup.string()
                    .max(100, "Must be 100 characters or less")
                    .trim()
                    .lowercase()
                    .required("Required"),
                  amount: Yup.number()
                    .min(1, "Must be a number greater than one")
                    .max(1000000, "Too big. Enter smaller value.")
                    .positive("Should be a positive number.")
                    .integer("Should be a integer.")
                    .required("Required"),
                  date: Yup.date()
                    .min("2000/01/01")
                    .required("Required"),
                  paid: Yup.mixed().required("Please selece a value"),
                  client: Yup.mixed().required("Please selece a value")
                });
              }}
              onSubmit={(values, { setSubmitting }) => {
                console.log(values);
                axios({
                  method: "put",
                  url: `/bills/${values.id_}`,
                  data: {
                    cashier: values.cashier,
                    client: values.client,
                    amount: values.amount,
                    paid: values.paid,
                    date: moment(values.date).format("YYYY/MM/DD")
                  }
                })
                  .then(response => {
                    console.log(response);
                    if (response.status === 200) {
                      setSubmitting(false);
                      setOpenUpdate(false);
                      dispatch({
                        type: "INVALIDATE_MENU_ITEM",
                        menuItem: "bills"
                      });
                      dispatch(fetchDataIfNeeded("bills"));
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
                    Update Bill
                  </Typography>
                  <Form>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Field
                          type="number"
                          label="Bill Number"
                          name="id_"
                          component={TextField}
                          fullWidth
                          disabled
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Field
                          type="text"
                          name="client"
                          label="Client"
                          select
                          variant="standard"
                          helperText="Please select Range"
                          margin="normal"
                          fullWidth
                          component={TextField}
                        >
                          {clientData.map(data => (
                            <MenuItem key={data.id_} value={data.id_}>
                              {data.name}
                            </MenuItem>
                          ))}
                        </Field>
                      </Grid>
                      <Grid item xs={12}>
                        <Field
                          type="number"
                          label="Amount"
                          name="amount"
                          component={TextField}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Field
                          label="Date"
                          name="date"
                          fullWidth
                          component={({ field, form, ...other }) => {
                            const currentError = form.errors[field.name];

                            return (
                              <DatePicker
                                clearable
                                name={field.name}
                                value={field.value}
                                openTo="year"
                                format="YYYY/MM/DD"
                                views={["year", "month", "date"]}
                                // helperText={currentError}
                                // error={Boolean(currentError)}
                                // onError={error => {
                                //   if (error !== currentError) {
                                //     form.setFieldError(field.name, error);
                                //   }
                                // }}
                                onChange={date =>
                                  form.setFieldValue(field.name, date, true)
                                }
                                {...other}
                              />
                            );
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Field
                          type="text"
                          name="paid"
                          label="Paid"
                          select
                          variant="standard"
                          margin="normal"
                          fullWidth
                          component={TextField}
                        >
                          <MenuItem key="1" value="paid">
                            Pending
                          </MenuItem>
                          <MenuItem key="2" value="pending">
                            Paid
                          </MenuItem>
                        </Field>
                      </Grid>
                      <Grid item xs={12}>
                        <Field
                          type="text"
                          label="Cashier"
                          name="cashier"
                          component={TextField}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12}>
                        {isSubmitting && <LinearProgress />}
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
