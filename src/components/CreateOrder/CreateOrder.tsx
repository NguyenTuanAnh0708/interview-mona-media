import React, {useEffect, useMemo, useState} from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControlLabel,
  MenuItem,
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

import Grid from '@mui/material/Grid2';
import {useForm, Controller} from 'react-hook-form';
import {formatVND} from '../../lib/utils/currencyUtils';

import type {
  CartItem,
  FormData,
  IOrderDetails,
  IProduct,
} from '../../types/types';
import productsMock from '../../mock/productsMock';
import discountCodesMock from '../../mock/discountCodesMock';
import ConfirmOrder from './ConfirmOrder/ConfirmOrder';

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
      cashGiven: 0,
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
      cart.reduce(
        (sum, item) => sum + (item.price - item.discountAmount) * item.quantity,
        0
      ),
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

      if (discount) {
        const updatedItem = updatedCart[index];

        if (discount.type === 'percent') {
          discountAmount = (updatedItem.price * discount.value) / 100;
        } else if (discount.type === 'flat') {
          discountAmount = discount.value;
        }

        updatedCart[index] = {
          ...updatedItem,
          discountAmount: discountAmount,
        };
      } else {
        updatedCart[index] = {
          ...updatedCart[index],
          discountAmount: discountAmount,
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
    if (data.cashGiven < total) {
      alert('Số tiền khách đưa thiếu');
      return;
    }
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
          <Grid size={{xs: 12, md: 4}}>
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
          <Grid size={{xs: 12, md: 8}}>
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
                          type='number'
                          value={item.price}
                          onChange={(e) =>
                            updateCartItem(index, 'price', e.target.value)
                          }
                          slotProps={{
                            htmlInput: {
                              min: 0,
                            },
                          }}
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
                          slotProps={{
                            htmlInput: {
                              min: 1,
                            },
                          }}
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
                        {formatVND(
                          (item.price - item.discountAmount) * item.quantity
                        )}
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
              <RadioGroup
                row
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  // if (e.target.value === 'cash') {
                  //   setValue('cashGiven', 0);
                  // }
                }}
              >
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
                  type='number'
                  fullWidth
                  label='Tiền khách đưa'
                  value={field.value}
                  onChange={(e) =>
                    setValue('cashGiven', Number(e.target.value))
                  }
                  error={!!errors.cashGiven}
                  helperText={errors.cashGiven?.message}
                  margin='normal'
                  slotProps={{
                    htmlInput: {
                      min: 0,
                    },
                  }}
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
              Tạo đơn
            </Button>
          </CardContent>
        </Card>
      </form>
      {}
      <ConfirmOrder
        openModal={openModal}
        handleCloseModal={handleCloseModal}
        orderDetails={orderDetails}
      />
    </Box>
  );
};
