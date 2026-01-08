// app/signin/minimal/page.js
'use client'

import {
  Box,
  Flex,
  VStack,
  HStack,
  Heading,
  Text,
  Image,
  Input,
  Button,
  Field,
  InputGroup,
  Divider,
  IconButton,
  Container,
  Card,
  Link,
  useToast,
  Spinner,
} from '@chakra-ui/react'
import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { FiMail, FiLock, FiEye, FiEyeOff, FiChevronRight } from 'react-icons/fi'
import { toaster } from "@/components/ui/toaster"
import { useAuth } from '@/components/Auth'

export default function MinimalSignInPage() {

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams();
  const router = useRouter();
  const returnUrl = searchParams.get('return_url');
  const { login } = useAuth()
  
  // Initialize React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onBlur', // Validate on blur for better UX
  })

  const onSubmit = async (data) => {
    setLoading(true)
    clearErrors() // Clear any previous errors

    try {
      // Replace with your actual API call
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/loginuser`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          email: data.email,
          password: data.password,
        }).toString(),
      })

      const result = await response.json()

      if (response.ok && result.status) {
            // Login with the token and user data
            login(result.token)

            toaster.create({
                title: 'Welcome aboard!',
                description: 'Successfully signed in to your account',
                type: 'success',
                duration: 3000,
            })
          
            // Redirect to dashboard or home page
            if (returnUrl) {
                // Decode and redirect to the original URL
                const decodedUrl = decodeURIComponent(returnUrl);
                router.push(decodedUrl);
            } else {
                router.push('/home'); // Default redirect
            }

        } else {
          const message = result.errors.detail || 'Login failed. Please try again.'
          throw new Error(message)
        }
    } catch (error) {
      console.error('Login error:', error)
      // Show general error
      toaster.create({
        title: 'Login failed',
        description: error.message || 'An unexpected error occurred',
        type: 'error',
        duration: 5000,
      })
      
      // Set a general form error
      setError('root', {
        type: 'manual',
        message: error.message || 'Login failed. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = () => {
    router.push('/forgot-password')
  }

  const handleSignUp = () => {
    router.push('/register')
  }

  // Custom validation for email
  const validateEmail = (value) => {
    if (!value) {
      return 'Email is required'
    }
    
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address'
    }
    
    return true
  }

  // Custom validation for password
  const validatePassword = (value) => {
    if (!value) {
      return 'Password is required'
    }
    
    if (value.length < 6) {
      return 'Password must be at least 6 characters'
    }
    
    return true
  }

  return (
    <Flex minH="100vh" bg="gray.50" align="center" justify="center" p={4}>
      <Container maxW="md">
        {/* Logo */}
        <Flex justify="center" mb={8}>
          <Image
            src="/logo/logo.png"
            alt="Smallyfares Logo"
            height="48px"
          />
        </Flex>

        <Card.Root variant="outline" p={8}>
          <VStack spacing={6}>
            {/* Header */}
            <VStack spacing={2} textAlign="center">
              <Heading as="h1" size="lg" color="gray.800">
                Welcome Back
              </Heading>
              <Text color="gray.600" fontSize="sm">
                Sign in to continue to your account
              </Text>
            </VStack>

            {/* Form with React Hook Form */}
            <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
              <VStack spacing={4}>
                {/* Email Field */}
                <Field.Root invalid={!!errors.email}>
                  <Field.Label htmlFor="email" fontSize="sm" color="gray.700">
                    Email
                  </Field.Label>
                  <InputGroup 
                    size="lg"
                    endElement={<FiMail color={errors.email ? "#E53E3E" : "gray.400"} />}
                  >
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      {...register('email', {
                        required: 'Email is required',
                        validate: validateEmail,
                        onChange: () => clearErrors('email'),
                      })}
                      aria-invalid={errors.email ? "true" : "false"}
                    />
                  </InputGroup>
                  {errors.email && (
                    <Field.ErrorText fontSize="xs" color="red.500">
                      {errors.email.message}
                    </Field.ErrorText>
                  )}
                </Field.Root>

                {/* Password Field */}
                <Field.Root invalid={!!errors.password}>
                  <Field.Label htmlFor="password" fontSize="sm" color="gray.700">
                    Password
                  </Field.Label>
                  <InputGroup size="lg"
                    endElement={
                        <HStack spacing={1}>
                            <IconButton
                                variant="ghost"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                onClick={() => setShowPassword(!showPassword)}
                                size="sm"
                                color={errors.password ? "red.500" : "gray.500"}
                            >
                                {showPassword ? <FiEyeOff /> : <FiEye />}
                            </IconButton>
                            <FiLock color={errors.password ? "#E53E3E" : "gray.400"} />
                        </HStack>
                        }
                  >
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      {...register('password', {
                        required: 'Password is required',
                        validate: validatePassword,
                        onChange: () => clearErrors('password'),
                      })}
                      aria-invalid={errors.password ? "true" : "false"}
                    />
                  </InputGroup>
                  {errors.password && (
                    <Field.ErrorText fontSize="xs" color="red.500">
                      {errors.password.message}
                    </Field.ErrorText>
                  )}
                </Field.Root>

                {/* Forgot Password Link */}
                <Flex justify="flex-end" width="100%">
                  <Link
                    href="/forgot-password"
                    fontSize="sm"
                    color="blue.500"
                    fontWeight="medium"
                    onClick={handleForgotPassword}
                  >
                    Forgot password?
                  </Link>
                </Flex>

                {/* Root Error Display */}
                {errors.root && (
                  <Box 
                    width="100%" 
                    p={3} 
                    bg="red.50" 
                    borderRadius="md" 
                    border="1px" 
                    borderColor="red.200"
                  >
                    <Text fontSize="sm" color="red.600">
                      {errors.root.message}
                    </Text>
                  </Box>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  width="100%"
                  loading={loading || isSubmitting}
                  loadingText="Signing in..."
                  spinner={<Spinner size="sm" />}
                  rightIcon={<FiChevronRight />}
                  disabled={loading || isSubmitting}
                >
                  Sign In
                </Button>
              </VStack>
            </form>

            {/* Sign Up Link */}
            <HStack spacing={1} justify="center">
              <Text fontSize="sm" color="gray.600">
                New to Smallyfares?
              </Text>
              <Button
                variant="link"
                fontSize="sm"
                color="blue.500"
                fontWeight="semibold"
                onClick={handleSignUp}
              >
                Create an account
              </Button>
            </HStack>
          </VStack>
        </Card.Root>

        {/* Footer Links */}
        <HStack spacing={4} justify="center" mt={8}>
          <Link href="/contact" fontSize="sm" color="gray.500">
            Support
          </Link>
          <Text color="gray.300">•</Text>
          <Link href="/privacy" fontSize="sm" color="gray.500">
            Privacy
          </Link>
          <Text color="gray.300">•</Text>
          <Link href="/terms" fontSize="sm" color="gray.500">
            Terms
          </Link>
        </HStack>
      </Container>
    </Flex>
  )
}