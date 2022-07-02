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
import { axios } from "../utils/axios";
import toast from "react-hot-toast";
import { createDiffieHellman } from "diffie-hellman"
import { useDiffieHellman } from "../store/dh.store";
import { CURVE } from "../utils/dh";
import createECDH from "create-ecdh";
window.Buffer = window.Buffer || require("buffer").Buffer; 

interface SignupFormInputs {
  username: string;
  password: string;
}

export const Signup = () => {
  const setDHKeys = useDiffieHellman(state => state.setKeys);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<SignupFormInputs>();
  const [isSigningup, setIsSigningup] = useState(false);

  const handleSignup = async (data: SignupFormInputs) => {
    setIsSigningup(true);
    
    const dh = createECDH(CURVE);
    dh.generateKeys();

    try {
      const res = await axios.post("/api/sign-up", {
        ...data,
        publicKey: dh.getPublicKey("hex"),
      });
      console.log(res);
      setDHKeys(dh.getPrivateKey("hex"), dh.getPublicKey("hex"));
      toast.success("Successfully signed up! Please login :D");
      onClose();
    } catch (error) {
      console.log(error)
    } finally {
      setIsSigningup(false)
    }
  }

  return (
    <>
      <Button onClick={onOpen}>Sign up</Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent as="form" onSubmit={handleSubmit(handleSignup)}>
          <ModalHeader>User Signup</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box display="flex" flexDir="column" rowGap="2rem">
              <FormControl isInvalid={!!errors.username}>
                <FormLabel htmlFor="username">Username</FormLabel>
                <Input
                  id="username"
                  type="username"
                  {...register("username", {
                    required: "Username is required",
                  })}
                />
                {!errors.username ? (
                  <FormHelperText>Enter a flashy username 🚀</FormHelperText>
                ) : (
                  <FormErrorMessage>{errors.username.message}</FormErrorMessage>
                )}
              </FormControl>
              <FormControl isInvalid={!!errors.password}>
                <FormLabel htmlFor="password">Password</FormLabel>
                <Input
                  id="password"
                  letterSpacing="0.25rem"
                  type="password"
                  {...register("password", {
                    required: "Password is required",
                  })}
                />
                {!errors.password ? (
                  <FormHelperText>Enter a strong password</FormHelperText>
                ) : (
                  <FormErrorMessage>{errors.password.message}</FormErrorMessage>
                )}
              </FormControl>
            </Box>

          </ModalBody>

          <ModalFooter justifyContent="center" mt={10}>
            <Button isLoading={isSigningup} loadingText="Creating account.." colorScheme="blue" type="submit" w="full">
              Signup
            </Button>
            {/* <Button variant="ghost">Secondary Action</Button> */}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
