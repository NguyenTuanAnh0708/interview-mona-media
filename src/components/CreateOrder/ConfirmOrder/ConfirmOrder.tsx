import React from 'react';
import {
  Box,
  Button,
  Fade,
  Modal,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import {formatVND} from '../../../lib/utils/currencyUtils';
import {IOrderDetails} from '../../../types/types';

interface IConfirmOrder {
  openModal: boolean;
  handleCloseModal: () => void;
  orderDetails: IOrderDetails | null;
}

const ConfirmOrder = ({
  openModal,
  handleCloseModal,
  orderDetails,
}: IConfirmOrder) => {
  return (
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
                  <TableCell>Phương thức thanh toán</TableCell>
                  <TableCell>{orderDetails?.paymentMethod}</TableCell>
                </TableRow>

                {orderDetails?.paymentMethod == 'cash' && (
                  <>
                    <TableRow>
                      <TableCell>Số Tiền khách Trả</TableCell>
                      <TableCell>
                        {formatVND(orderDetails?.cashGiven || 0)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Trả lại khách</TableCell>
                      <TableCell>
                        {formatVND(
                          Number(orderDetails?.cashGiven) -
                            Number(orderDetails?.total) || 0
                        )}
                      </TableCell>
                    </TableRow>
                  </>
                )}
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
                      {formatVND(
                        (item.price - item.discountAmount) * item.quantity
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={4} align='right'>
                    <strong>Tổng tiền</strong>
                  </TableCell>
                  <TableCell>{formatVND(orderDetails?.total || 0)}</TableCell>
                </TableRow>
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
  );
};

export default ConfirmOrder;
