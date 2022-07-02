import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useAuth } from "../store/auth.store";
import { axios } from "../utils/axios";

interface LoginFormInputs {
  username: string;
  password: string;
}

export const Login = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<LoginFormInputs>();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const setUser = useAuth((state) => state.setUser);

  const handleLogin = async (data: LoginFormInputs) => {
    setIsLoggingIn(true);
    try {
      const res = await axios.post("/api/login", data);
      const { token, username, uid } = res.data;
      console.log(res.data)
      if (!token || !username || !uid) {
        toast.error("Something went wrong. Please try again.");
        throw new Error("Invalid response from server");
      }
      setUser({
        username,
        token,
        uid,
      });
      toast.success("Logged in successfully as", username);
      onClose();
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <>
      <Button onClick={onOpen}>Login</Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent as="form" onSubmit={handleSubmit(handleLogin)}>
          <ModalHeader>User Login</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box display="flex" flexDir="column" rowGap="1rem">
              <FormControl isInvalid={!!errors.username}>
                <FormLabel htmlFor="username">Username</FormLabel>
                <Input
                  placeholder="john00"
                  id="username"
                  type="username"
                  {...register("username", {
                    required: "Username is required",
                  })}
                />
                {!!errors.username && (
                  <FormErrorMessage>{errors.username.message}</FormErrorMessage>
                )}
              </FormControl>
              <FormControl isInvalid={!!errors.password}>
                <FormLabel htmlFor="password">Password</FormLabel>
                <Input
                  placeholder="********"
                  letterSpacing="0.25rem"
                  id="password"
                  type="password"
                  {...register("password", {
                    required: "Password is required",
                  })}
                />
                {!!errors.password && (
                  <FormErrorMessage>{errors.password.message}</FormErrorMessage>
                )}
              </FormControl>
            </Box>
          </ModalBody>

          <ModalFooter justifyContent="center" mt={6}>
            <Button
              isLoading={isLoggingIn}
              loadingText="Logging in.."
              colorScheme="blue"
              type="submit"
              w="full"
            >
              Login
            </Button>
            {/* <Button variant="ghost">Secondary Action</Button> */}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
