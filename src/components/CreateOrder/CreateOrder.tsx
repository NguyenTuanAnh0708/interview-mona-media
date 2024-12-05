import React, {useEffect, useMemo, useState} from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Fade,
  FormControlLabel,
  Grid,
  MenuItem,
  Modal,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import {useForm, Controller} from 'react-hook-form';
import {formatVND, parseVNDInput} from '../../lib/utils/currencyUtils';

import type {
  CartItem,
  FormData,
  IOrderDetails,
  IProduct,
} from '../../types/types';
import productsMock from '../../mock/productsMock';
import discountCodesMock from '../../mock/discountCodesMock';

export const CreateOrder: React.FC = () => {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: {errors},
  } = useForm<FormData>({
    defaultValues: {
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      paymentMethod: 'cash',
      cashGiven: '',
    },
  });

  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const paymentMethod = watch('paymentMethod');
  const cashGiven = watch('cashGiven');
  const [orderDetails, setOrderDetails] = useState<IOrderDetails | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const total = useMemo(
    () =>
      cart.reduce((sum, item) => sum + item.discountedPrice * item.quantity, 0),
    [cart]
  );

  useEffect(() => {
    setProducts(productsMock);
  }, []);

  const addProductToCart = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setCart((prev) => [
        ...prev,
        {
          ...product,
          quantity: 1,
          discountCode: '',
          discountedPrice: product.price,
          discountAmount: 0,
        },
      ]);
    }
  };

  const updateCartItem = (
    index: number,
    field: keyof CartItem,
    value: string | number
  ) => {
    const updatedCart = [...cart];
    updatedCart[index] = {
      ...updatedCart[index],
      [field]: value,
    };

    if (field === 'discountCode') {
      const discountCode = value as string;
      const discount = discountCodesMock.find((d) => d.code === discountCode);
      let discountAmount = 0;
      let discountedPrice = updatedCart[index].price;

      if (discount) {
        const updatedItem = updatedCart[index];

        if (discount.type === 'percent') {
          discountAmount = updatedItem.price * (discount.value / 100);
          discountedPrice = updatedItem.price - discountAmount;
        } else if (discount.type === 'flat') {
          discountAmount = discount.value;
          discountedPrice = Math.max(0, updatedItem.price - discountAmount);
        }

        updatedCart[index] = {
          ...updatedItem,
          discountAmount: discountAmount,
          discountedPrice: discountedPrice,
        };
      } else {
        updatedCart[index] = {
          ...updatedCart[index],
          discountAmount: discountAmount,
          discountedPrice: updatedCart[index].price,
        };
      }
    }

    setCart(updatedCart);
  };

  const removeCartItem = (index: number) => {
    const updatedCart = [...cart];
    updatedCart.splice(index, 1);
    setCart(updatedCart);
  };

  const onSubmit = (data: FormData) => {
    setOrderDetails({...data, cart, total});
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  return (
    <Box sx={{padding: 4}}>
      <Typography variant='h4' gutterBottom textAlign={'center'}>
        Tạo Đơn Hàng
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          {/* Customer Info */}
          <Grid item xs={12} md={4}>
            <Typography variant='h6'>Thông tin khách hàng</Typography>
            <Controller
              name='customerName'
              control={control}
              rules={{required: 'Tên khách hàng là bắt buộc'}}
              render={({field}) => (
                <TextField
                  {...field}
                  fullWidth
                  label='Tên khách hàng'
                  margin='normal'
                  error={!!errors.customerName}
                  helperText={errors.customerName?.message}
                />
              )}
            />
            <Controller
              name='customerEmail'
              control={control}
              rules={{
                required: 'Email khách hàng là bắt buộc',
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                  message: 'Email không hợp lệ',
                },
              }}
              render={({field}) => (
                <TextField
                  {...field}
                  fullWidth
                  label='Email khách hàng'
                  margin='normal'
                  type='email'
                  error={!!errors.customerEmail}
                  helperText={errors.customerEmail?.message}
                />
              )}
            />
            <Controller
              name='customerPhone'
              control={control}
              rules={{
                required: 'Số điện thoại khách hàng là bắt buộc',
                pattern: {
                  value: /^(0|\+84)(9|3|7|8|5)\d{8}$/,
                  message: 'Số điện thoại không hợp lệ',
                },
              }}
              render={({field}) => (
                <TextField
                  {...field}
                  fullWidth
                  label='Số điện thoại khách hàng'
                  margin='normal'
                  type='tel'
                  error={!!errors.customerPhone}
                  helperText={errors.customerPhone?.message}
                />
              )}
            />
          </Grid>

          {/* Product Selection */}
          <Grid item xs={12} md={8}>
            <Typography variant='h6'>Giỏ hàng</Typography>
            <Select
              displayEmpty
              fullWidth
              value=''
              onChange={(e) => addProductToCart(Number(e.target.value))}
            >
              <MenuItem value='' disabled>
                Chọn sản phẩm
              </MenuItem>
              {products.map((product) => (
                <MenuItem key={product.id} value={product.id}>
                  {product.name} - {formatVND(product.price)}
                </MenuItem>
              ))}
            </Select>
            <TableContainer
              component={Paper}
              style={{maxHeight: '400px', minHeight: '400px'}}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Sản phẩm</TableCell>
                    <TableCell>Đơn giá</TableCell>
                    <TableCell>Số lượng</TableCell>
                    <TableCell>Mã giảm giá</TableCell>
                    <TableCell>Thành tiền</TableCell>
                    <TableCell>Hành động</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cart.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>
                        <TextField
                          type='text'
                          value={formatVND(item.price)}
                          onChange={(e) =>
                            updateCartItem(
                              index,
                              'price',
                              parseVNDInput(e.target.value)
                            )
                          }
                          inputProps={{min: 0}}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type='number'
                          value={item.quantity}
                          onChange={(e) =>
                            updateCartItem(
                              index,
                              'quantity',
                              Number(e.target.value)
                            )
                          }
                          inputProps={{min: 1}}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          value={item.discountCode}
                          onChange={(e) =>
                            updateCartItem(
                              index,
                              'discountCode',
                              e.target.value
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        {formatVND(item.discountedPrice * item.quantity)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant='contained'
                          color='error'
                          onClick={() => removeCartItem(index)}
                        >
                          Xóa
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>

        {/* Payment Method */}
        <Box sx={{marginTop: 4}}>
          <Typography variant='h6'>Phương thức thanh toán</Typography>
          <Controller
            name='paymentMethod'
            control={control}
            render={({field}) => (
              <RadioGroup row {...field}>
                <FormControlLabel
                  value='cash'
                  control={<Radio />}
                  label='Tiền mặt'
                />
                <FormControlLabel
                  value='card'
                  control={<Radio />}
                  label='Thẻ'
                />
              </RadioGroup>
            )}
          />
          {paymentMethod === 'cash' && (
            <Controller
              name='cashGiven'
              control={control}
              rules={{required: 'Tiền mặt là bắt buộc'}}
              render={({field}) => (
                <TextField
                  {...field}
                  fullWidth
                  label='Tiền khách đưa'
                  value={formatVND(field.value)}
                  onChange={(e) =>
                    setValue('cashGiven', parseVNDInput(e.target.value))
                  }
                  error={!!errors.cashGiven}
                  helperText={errors.cashGiven?.message}
                  margin='normal'
                />
              )}
            />
          )}
          {paymentMethod === 'cash' && Number(cashGiven) > total && (
            <Typography>
              Tiền thừa trả khách: {formatVND(Number(cashGiven) - total)}
            </Typography>
          )}
        </Box>

        {/* Order Summary */}
        <Card sx={{marginTop: 4}}>
          <CardContent>
            <Typography variant='h6'>Tổng cộng: {formatVND(total)}</Typography>
            <Button variant='contained' color='primary' type='submit'>
              Tạo đơn hàng
            </Button>
          </CardContent>
        </Card>
      </form>

      <Modal open={openModal} onClose={handleCloseModal} closeAfterTransition>
        <Fade in={openModal}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              padding: 4,
              backgroundColor: 'white',
              borderRadius: 2,

              width: '90vw',
            }}
          >
            <Typography variant='h6' gutterBottom>
              Xác nhận đơn hàng
            </Typography>

            {/* Display Order Information */}
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>Thông tin</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Chi tiết</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Khách hàng</TableCell>
                    <TableCell>{orderDetails?.customerName}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Email</TableCell>
                    <TableCell>{orderDetails?.customerEmail}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Số điện thoại</TableCell>
                    <TableCell>{orderDetails?.customerPhone}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Tổng tiền</TableCell>
                    <TableCell>{formatVND(orderDetails?.total || 0)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Typography variant='h6' gutterBottom sx={{marginTop: 3}}>
              Giỏ hàng
            </Typography>
            <TableContainer component={Paper} sx={{maxHeight: 400}}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Sản phẩm</TableCell>
                    <TableCell>Đơn giá</TableCell>
                    <TableCell>Số lượng</TableCell>
                    <TableCell>Mã giảm giá</TableCell>
                    <TableCell>Thành tiền</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orderDetails?.cart.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{formatVND(item.price)}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.discountCode}</TableCell>
                      <TableCell>
                        {formatVND(item.discountedPrice * item.quantity)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{marginTop: 2}}>
              <Button
                variant='contained'
                color='primary'
                onClick={handleCloseModal}
              >
                Xác nhận
              </Button>
              <Button
                variant='outlined'
                sx={{marginLeft: 2}}
                onClick={handleCloseModal}
              >
                Hủy
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};
