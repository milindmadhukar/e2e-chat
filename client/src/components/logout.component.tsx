import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
  Text,
} from "@chakra-ui/react";
import toast from "react-hot-toast";
import { useAuth } from "../store/auth.store";

export const Logout = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const setUser = useAuth((state) => state.setUser);

  const handleLogout = () => {
    setUser({ username: "", token: "", uid: "" });
    toast.success("Logged out successfully");
    onClose();
  }

  return (
    <>
      <Button onClick={onOpen}>Logout</Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Logout</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Are You Sure You Want To Logout?</Text>
          </ModalBody>

          <ModalFooter justifyContent="center">
            <Button variant="solid" colorScheme="red" onClick={handleLogout}>
              Yes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
