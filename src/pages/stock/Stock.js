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

import { fetchDataIfNeeded } from "../../actions";

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

export default function Stock() {
  const [open, setOpen] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [updateValues, setUpdateValues] = useState({
    id_: "",
    item_code: "",
    qty: "",
    retail_price: "",
    wholesale_price: "",
    mfd_date: "",
    exp_date: ""
  });
  const classes = useStyles();
  const [modalStyle] = useState(getModalStyle);
  const dispatch = useDispatch();

  const selectedMenuItem = useSelector(state => state.selectedMenuItem);

  useEffect(() => {
    selectedMenuItem !== "stocks" &&
      dispatch({ type: "SELECT_MENU_ITEM", menuItem: "stocks" });
  }, [selectedMenuItem, dispatch]);

  dispatch(fetchDataIfNeeded("stocks"));

  const isLoading = useSelector(
    state => state.dataPerMenuItem.stocks.isFetching
  );

  var data = useSelector(state => state.dataPerMenuItem.stocks.content.data);

  var notificationData=[]

  if (!isLoading) {
    var dataTableData = [];
    var count = 0;

    data.map(item => {
      var temp = [];

      temp[0] = item.id_;
      temp[1] = item.item_name;
      temp[2] = item.retail_price;
      temp[3] = item.qty;
      temp[4] = item.wholesale_price;
      temp[5] = moment(item.mfd_date).format("YYYY/MM/DD");
      temp[6] = moment(item.exp_date).format("YYYY/MM/DD");

      count++;

      dataTableData.push(temp);

      var a = moment(item.exp_date);
      var b = moment(new Date());

      if (
        a.diff(b, "days") < 30 &&
        notificationData.find(i => {
          return i.id_ === item.id_;
        }) === undefined
      ) {
        notificationData.push(item);
      }
    });
  }

  dispatch(fetchDataIfNeeded("items"));

  var itemData = useSelector(state => state.dataPerMenuItem.items.content);

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
      name: "Retail Price",
      options: {
        filter: false,
        sort: true
      }
    },
    {
      name: "Quantity",
      options: {
        filter: false,
        sort: true
      }
    },
    {
      name: "Wholesale Price",
      options: {
        filter: false,
        sort: true
      }
    },
    {
      name: "Manufacture Date",
      options: {
        filter: false,
        sort: true
      }
    },
    {
      name: "Expiration Date",
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
                      url: `/stocks/${tableMeta.rowData[0]}`
                    })
                      .then(response => {
                        console.log(response);
                        if (response.status === 200) {
                          dispatch({
                            type: "INVALIDATE_MENU_ITEM",
                            menuItem: "stocks"
                          });
                          dispatch(fetchDataIfNeeded("stocks"));
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
                      item_code: tableMeta.rowData[1],
                      qty: tableMeta.rowData[3],
                      retail_price: tableMeta.rowData[2],
                      wholesale_price: tableMeta.rowData[4],
                      mfd_date: tableMeta.rowData[5],
                      exp_date: tableMeta.rowData[6]
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
      <PageTitle title="Stock" />
      <Grid container spacing={4}>
        {!isLoading && (
          <Grid item xs={12}>
            {notificationData.map(i => (
              <Box
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
                      {`Item number ${i.id_} has less than month till Expiration Date.`}
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
              </Box>
            ))}
          </Grid>
        )}
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
              <Grid item xs={12}>
                <Card
                  className={classes.card}
                  style={{ backgroundColor: "#4fc3f7", borderRadius: "10px" }}
                >
                  <CardHeader
                    title="Total Stock Count"
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
              title="Items"
              data={dataTableData}
              columns={columns}
              options={{
                filterType: "checkbox"
              }}
              style={{
                minWidth: "500px"
              }}
            />
          )}
        </Grid>
        <Grid item xs={12}>
          {!isLoading && (
            <>
              <Card raised={true}>
                <CardHeader
                  title="Expiration Date"
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
                item_code: "",
                retail_price: "",
                qty: "",
                wholesale_price: "",
                mfd_date: new Date(),
                exp_date: new Date()
              }}
              validationSchema={() => {
                return Yup.object({
                  item_code: Yup.string().required("Required"),
                  retail_price: Yup.number()
                    .min(1, "Must be a number greater than one")
                    .max(1000000, "Too big. Enter smaller value.")
                    .positive("Should be a positive number.")
                    .required("Required"),
                  qty: Yup.number()
                    .min(1, "Must be a number greater than one")
                    .max(1000000, "Too big. Enter smaller value.")
                    .positive("Should be a positive number.")
                    .integer("Should be a integer.")
                    .required("Required"),
                  wholesale_price: Yup.number()
                    .min(1, "Must be a number greater than one")
                    .max(1000000, "Too big. Enter smaller value.")
                    .positive("Should be a positive number.")
                    .integer("Should be a integer.")
                    .required("Required"),
                  mfd_date: Yup.date()
                    .min("2000/01/01")
                    .required("Required"),
                  exp_date: Yup.date()
                    .min("2000/01/01")
                    .when(
                      "mfd_date",
                      (mfd_date, schema) =>
                        mfd_date &&
                        schema.min(
                          mfd_date,
                          "This should be grater than Manufacture Date"
                        )
                    )
                    .required("Required")
                });
              }}
              onSubmit={(values, { setSubmitting }) => {
                console.log(values);
                axios({
                  method: "post",
                  url: "/stocks/",
                  data: {
                    item_code: values.item_code,
                    qty: values.qty,
                    retail_price: values.retail_price,
                    wholesale_price: values.wholesale_price,
                    mfd_date: values.mfd_date,
                    exp_date: values.exp_date
                  },
                  headers: { "content-type": "application/json" }
                })
                  .then(response => {
                    console.log(response);
                    if (response.status === 200) {
                      setSubmitting(false);
                      setOpen(false);
                      dispatch({
                        type: "INVALIDATE_MENU_ITEM",
                        menuItem: "stocks"
                      });
                      dispatch(fetchDataIfNeeded("stocks"));
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
                    Add Stock
                  </Typography>
                  <Form>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Field
                          type="text"
                          name="item_code"
                          label="Item"
                          select
                          variant="standard"
                          helperText="Please select Range"
                          margin="normal"
                          fullWidth
                          component={TextField}
                        >
                          {itemData.map(data => (
                            <MenuItem key={data.id_} value={data.id_}>
                              {data.name}
                            </MenuItem>
                          ))}
                        </Field>
                      </Grid>
                      <Grid item xs={12}>
                        <Field
                          type="number"
                          label="Retail Price"
                          name="retail_price"
                          component={TextField}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Field
                          type="number"
                          label="Quantity"
                          name="qty"
                          component={TextField}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Field
                          type="number"
                          label="Wholesale Price"
                          name="wholesale_price"
                          component={TextField}
                          fullWidth
                        />
                      </Grid>
                      <Grid item sm={6}>
                        <Field
                          label="Manufacture Date"
                          name="mfd_date"
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
                      <Grid item sm={6}>
                        <Field
                          label="Expiration Date"
                          name="exp_date"
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
                                helperText={currentError}
                                error={Boolean(currentError)}
                                onError={error => {
                                  if (error !== currentError) {
                                    form.setFieldError(field.name, error);
                                  }
                                }}
                                onChange={date =>
                                  form.setFieldValue(field.name, date._d, true)
                                }
                                {...other}
                              />
                            );
                          }}
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
                item_code: updateValues.item_code,
                retail_price: updateValues.retail_price,
                qty: updateValues.qty,
                wholesale_price: updateValues.wholesale_price,
                mfd_date: updateValues.mfd_date,
                exp_date: updateValues.exp_date
              }}
              validationSchema={() => {
                return Yup.object({
                  retail_price: Yup.number()
                    .min(1, "Must be a number greater than one")
                    .max(1000000, "Too big. Enter smaller value.")
                    .positive("Should be a positive number.")
                    .required("Required"),
                  qty: Yup.number()
                    .min(1, "Must be a number greater than one")
                    .max(1000000, "Too big. Enter smaller value.")
                    .positive("Should be a positive number.")
                    .integer("Should be a integer.")
                    .required("Required"),
                  wholesale_price: Yup.number()
                    .min(1, "Must be a number greater than one")
                    .max(1000000, "Too big. Enter smaller value.")
                    .positive("Should be a positive number.")
                    .integer("Should be a integer.")
                    .required("Required"),
                  mfd_date: Yup.date()
                    .min("2000/01/01")
                    .required("Required"),
                  exp_date: Yup.date()
                    .min("2000/01/01")
                    .when(
                      "mfd_date",
                      (mfd_date, schema) =>
                        mfd_date &&
                        schema.min(
                          mfd_date,
                          "This should be grater than Manufacture Date"
                        )
                    )
                    .required("Required")
                });
              }}
              onSubmit={(values, { setSubmitting }) => {
                console.log(values);
                axios({
                  method: "put",
                  url: `/stocks/${updateValues.id_}`,
                  data: {
                    qty: values.qty,
                    retail_price: values.retail_price,
                    wholesale_price: values.wholesale_price,
                    mfd_date: values.mfd_date,
                    exp_date: values.exp_date
                  },
                  headers: { "content-type": "application/json" }
                })
                  .then(response => {
                    console.log(response);
                    if (response.status === 200) {
                      setSubmitting(false);
                      setOpenUpdate(false);
                      dispatch({
                        type: "INVALIDATE_MENU_ITEM",
                        menuItem: "stocks"
                      });
                      dispatch(fetchDataIfNeeded("stocks"));
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
                    Add Stock
                  </Typography>
                  <Form>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Field
                          type="text"
                          label="Item"
                          name="item_code"
                          component={TextField}
                          fullWidth
                          disabled
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Field
                          type="number"
                          label="Retail Price"
                          name="retail_price"
                          component={TextField}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Field
                          type="number"
                          label="Quantity"
                          name="qty"
                          component={TextField}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Field
                          type="number"
                          label="Wholesale Price"
                          name="wholesale_price"
                          component={TextField}
                          fullWidth
                        />
                      </Grid>
                      <Grid item sm={6}>
                        <Field
                          label="Manufacture Date"
                          name="mfd_date"
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
                      <Grid item sm={6}>
                        <Field
                          label="Expiration Date"
                          name="exp_date"
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
                                helperText={currentError}
                                error={Boolean(currentError)}
                                onError={error => {
                                  if (error !== currentError) {
                                    form.setFieldError(field.name, error);
                                  }
                                }}
                                onChange={date =>
                                  form.setFieldValue(field.name, date._d, true)
                                }
                                {...other}
                              />
                            );
                          }}
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
