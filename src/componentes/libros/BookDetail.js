import React, { useState } from 'react';
import {
  Box,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure
} from '@chakra-ui/react';
import BookForm from './BookForm';

const BookDetail = ({ bookId }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleEditSuccess = () => {
    onClose();
    // You can add a refresh function here if needed
  };

  return (
    <Box>
      <Button onClick={onOpen} colorScheme="blue" size="sm">
        Editar Libro
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Editar Libro</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <BookForm bookId={bookId} onSuccess={handleEditSuccess} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default BookDetail;