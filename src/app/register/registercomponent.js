// app/signup/page.js
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
  Container,
  Card,
  Link,
  Spinner,
  Alert,
  IconButton,
  Progress,
  Badge,
  Group
} from '@chakra-ui/react'
import { useState, useEffect, useRef, use, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { parseCookies, setCookie, destroyCookie } from 'nookies'
import { 
  FiMail, 
  FiLock, 
  FiEye, 
  FiEyeOff, 
  FiUser, 
  FiPhone,
  FiCheckCircle,
  FiClock,
  FiArrowLeft,
  FiSend
} from 'react-icons/fi'
import { toaster } from "@/components/ui/toaster"
import { useAuth } from '@/components/Auth'

// Cookie name for verification code
const VERIFICATION_COOKIE = 'email_verification_code'
const VERIFICATION_TIMEOUT = 5 * 60 // 5 minutes in seconds

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isVerificationSent, setIsVerificationSent] = useState(false)
  const [verificationTimer, setVerificationTimer] = useState(0)
  const [isResendLoading, setIsResendLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1) // 1: Basic info, 2: Verification
  const timerRef = useRef(null)
  const router = useRouter()
  const { login } = useAuth()

  // Initialize React Hook Form
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isValid },
    trigger,
    setError,
    clearErrors,
    getValues,
  } = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      verificationCode: '',
    },
    mode: 'onChange',
  })

  // Watch password for confirmation validation
  const password = watch('password')

  
  // Start countdown timer
  const startTimer = useCallback((seconds) => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    
    setVerificationTimer(seconds)
    
    timerRef.current = setInterval(() => {
      setVerificationTimer((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current)
          }
          setIsVerificationSent(false)
          destroyCookie(null, VERIFICATION_COOKIE, { path: '/' })
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [timerRef]);

  // Check if verification cookie exists
  useEffect(() => {
    const cookies = parseCookies()
    const verificationData = cookies[VERIFICATION_COOKIE]
    
    if (verificationData) {
      try {
        const data = JSON.parse(verificationData)
        const timeElapsed = Math.floor((Date.now() - data.timestamp) / 1000)
        const timeLeft = VERIFICATION_TIMEOUT - timeElapsed
        
        if (timeLeft > 0) {
          setIsVerificationSent(true)
          setVerificationTimer(timeLeft)
          startTimer(timeLeft)
        } else {
          // Cookie expired, remove it
          destroyCookie(null, VERIFICATION_COOKIE, { path: '/' })
        }
      } catch (error) {
        console.error('Error parsing verification cookie:', error)
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [startTimer, timerRef])


  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Send verification code
  const sendVerificationCode = async (email, name) => {
    setIsResendLoading(true)
    
    try {
      // Generate a 6-digit code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
      
      // Store code in cookie with timestamp
      const verificationData = {
        code: verificationCode,
        email: email,
        timestamp: Date.now(),
      }
      
      setCookie(null, VERIFICATION_COOKIE, JSON.stringify(verificationData), {
        maxAge: VERIFICATION_TIMEOUT,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      })

      // Send email with verification code
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/send_verification_code`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          email: email,
          code: verificationCode,
          name: name || '',
        }).toString(),
      })

      const result = await response.json()

      if (response.ok && result.status === true) {
        setIsVerificationSent(true)
        startTimer(VERIFICATION_TIMEOUT)
        
        toaster.create({
          title: 'Verification Code Sent',
          description: `We've sent a 6-digit code to ${email}. It will expire in 5 minutes.`,
          type: 'success',
          duration: 5000,
        })
        
        // Move to verification step
        setCurrentStep(2)
      } else {
        throw new Error(result.message || 'Failed to send verification code')
      }
    } catch (error) {
      console.error('Error sending verification code:', error)
      
      toaster.create({
        title: 'Failed to Send Code',
        description: error.message || 'Please try again',
        type: 'error',
        duration: 5000,
      })
    } finally {
      setIsResendLoading(false)
    }
  }

  // Handle sending verification code
  const handleSendVerification = async () => {
    const email = getValues('email')
    const name = getValues('fullName')
    
    // Validate email first
    const isEmailValid = await trigger('email')
    
    if (!isEmailValid) {
      toaster.create({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        type: 'warning',
        duration: 3000,
      })
      return
    }

    await sendVerificationCode(email, name)
  }

  // Resend verification code
  const handleResendVerification = async () => {
    if (verificationTimer > 0) {
      toaster.create({
        title: 'Please Wait',
        description: `You can resend the code in ${formatTime(verificationTimer)}`,
        type: 'info',
        duration: 3000,
      })
      return
    }

    const email = getValues('email')
    const name = getValues('fullName')
    await sendVerificationCode(email, name)
  }

  // Verify the code
  const verifyCode = (code) => {
    const cookies = parseCookies()
    const verificationData = cookies[VERIFICATION_COOKIE]
    
    if (!verificationData) {
      return false
    }

    try {
      const data = JSON.parse(verificationData)
      
      // Check if code matches and is not expired
      const timeElapsed = Math.floor((Date.now() - data.timestamp) / 1000)
      const isExpired = timeElapsed > VERIFICATION_TIMEOUT
      
      if (isExpired) {
        destroyCookie(null, VERIFICATION_COOKIE, { path: '/' })
        return false
      }
      
      return data.code === code && data.email === getValues('email')
    } catch (error) {
      return false
    }
  }

  // Form submission
  const onSubmit = async (data) => {
    try {
      // Verify code before registration
      if (currentStep === 2) {
        const isCodeValid = verifyCode(data.verificationCode)
        
        if (!isCodeValid) {
          setError('verificationCode', {
            type: 'manual',
            message: 'Invalid or expired verification code',
          })
          return
        }
      }

      // Proceed with registration
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/createuser`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          name: data.fullName,
          email: data.email,
          phone: data.phone,
          password: data.password,
        }).toString(),
      })

      const result = await response.json()

      if (response.ok && result.status) {
        // Clear verification cookie
        destroyCookie(null, VERIFICATION_COOKIE, { path: '/' })
        
        // Auto login if token is provided
        if (result.token) {
          login(result.token)
        }
        
        toaster.create({
          title: 'Account Created!',
          description: 'Your account has been successfully created.',
          type: 'success',
          duration: 5000,
        })
        
        // Redirect to dashboard
        router.push('/home')
        
      } else {
        const message = result.errors.detail || 'Registration failed'
        throw new Error(message || 'Registration failed')
      }
    } catch (error) {
      console.error('Error during registration:', error)
      const errorDescription = error.message

      toaster.create({
        title: 'Registration Failed',
        description: errorDescription || 'Please try again',
        type: 'error',
        duration: 5000,
      })
    }
  }

  // Custom validations
  const validatePhone = (value) => {
    if (!value) return 'Phone number is required'
    
    const phoneRegex = /^[0-9]{11}$/
    if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
      return 'Please enter a valid 11-digit phone number'
    }
    
    return true
  }

  const validatePasswordMatch = (value) => {
    if (!value) return 'Please confirm your password'
    if (value !== password) return 'Passwords do not match'
    return true
  }



  const goBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1)
    } else {
      router.push('/login')
    }
  }

  return (
    <Flex minH="100vh" bg="gray.50" align="center" justify="center" p={4}>
      <Container maxW="md">
        {/* Header with Back Button */}
        <HStack justify="space-between" mb={6}>
          <Button
            leftIcon={<FiArrowLeft />}
            variant="ghost"
            size="sm"
            onClick={goBack}
          >
            Back
          </Button>
          <Image
            src="/logo/logo.png"
            alt="Smallyfares Logo"
            height="40px"
          />
        </HStack>

        <Card.Root variant="outline" p={5}>
          <VStack spacing={6}>
            {/* Progress Steps */}
            <HStack spacing={2} width="100%">
              <Progress.Root 
                value={currentStep === 1 ? 0 : 100} 
                width="100%"
                size="xs"
                colorPalette="blue"
                variant="subtle"
              >
                <Progress.Track>
                  <Progress.Range />
                </Progress.Track>
              </Progress.Root>
              <Text fontSize="sm" color="gray.600" minW="60px">
                Step {currentStep} of 2
              </Text>
            </HStack>

            {/* Step Indicators */}
            <HStack spacing={2} width="100%">
              <Badge 
                colorPalette={currentStep >= 1 ? "blue" : "gray"} 
                variant={currentStep >= 1 ? "solid" : "subtle"}
              >
                1. Account Details
              </Badge>
              <Badge 
                colorPalette={currentStep >= 2 ? "blue" : "gray"} 
                variant={currentStep >= 2 ? "solid" : "subtle"}
              >
                2. Verify Email
              </Badge>
            </HStack>

            {/* Header */}
            <VStack spacing={2} textAlign="center">
              <Heading as="h1" size="lg" color="gray.800">
                Create Your Account
              </Heading>
              <Text color="gray.600" fontSize="sm">
                Join thousands of travelers and enjoy exclusive benefits
              </Text>
            </VStack>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
              <VStack spacing={4}>
                {/* Step 1: Account Details */}
                {currentStep === 1 && (
                  <>
                    {/* Full Name */}
                    <Field.Root invalid={!!errors.fullName}>
                      <Field.Label fontSize="sm" color="gray.700">
                        Full Name
                      </Field.Label>
                      <Controller
                        name="fullName"
                        control={control}
                        rules={{
                          required: 'Full name is required',
                          minLength: {
                            value: 2,
                            message: 'Name must be at least 2 characters',
                          },
                        }}
                        render={({ field }) => (
                          <InputGroup size="lg" endElement={<FiUser color={errors.fullName ? "#E53E3E" : "gray.400"} />}>
                            <Input
                              {...field}
                              placeholder="John Doe"
                              autoComplete="name"
                            />
                          </InputGroup>
                        )}
                      />
                      {errors.fullName && (
                        <Field.ErrorText fontSize="xs" color="red.500">
                          {errors.fullName.message}
                        </Field.ErrorText>
                      )}
                    </Field.Root>

                    {/* Email with Verification Button */}
                    <Field.Root invalid={!!errors.email}>
                      <Field.Label fontSize="sm" color="gray.700">
                        Email Address
                      </Field.Label>
                      <Controller
                        name="email"
                        control={control}
                        rules={{
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address',
                          },
                        }}
                        render={({ field }) => (
                  
                          <InputGroup size="lg" 
                          startAddon={
                                <FiMail color={errors.email ? "#E53E3E" : "gray.400"} />
                            }>
                            <Group attached w="full" maxW="sm">
                            <Input
                              {...field}
                              type="email"
                              placeholder="you@example.com"
                              autoComplete="email"
                              onChange={(e) => {
                                field.onChange(e)
                                clearErrors('email')
                              }}
                            />
                            <Button
                                  bg="bg.subtle" variant="outline"
                                  colorScheme="blue"
                                  onClick={handleSendVerification}
                                  loading={isResendLoading}
                                  loadingText="Sending..."
                                  leftIcon={<FiSend />}
                                  isDisabled={!field.value || !!errors.email || isVerificationSent}
                                >
                                  {isVerificationSent ? 'Sent' : 'Verify'}
                                </Button>
                            </Group>
                          </InputGroup>
                        )}
                      />
                      {errors.email && (
                        <Field.ErrorText fontSize="xs" color="red.500">
                          {errors.email.message}
                        </Field.ErrorText>
                      )}
                      {isVerificationSent && (
                        <HStack spacing={2} mt={2}>
                          <FiCheckCircle color="#38A169" />
                          <Text fontSize="xs" color="green.600">
                            Code sent! Check your email. Expires in {formatTime(verificationTimer)}
                          </Text>
                        </HStack>
                      )}
                    </Field.Root>

                    {/* Phone */}
                    <Field.Root invalid={!!errors.phone}>
                      <Field.Label fontSize="sm" color="gray.700">
                        Phone Number
                      </Field.Label>
                      <Controller
                        name="phone"
                        control={control}
                        rules={{
                          required: 'Phone number is required',
                          validate: validatePhone,
                        }}
                        render={({ field }) => (
                          <InputGroup size="lg" endElement={<FiPhone color={errors.phone ? "#E53E3E" : "gray.400"} />}>
                            <Input
                              {...field}
                              type="tel"
                              placeholder="+234 801 234 5678"
                              autoComplete="tel"
                            />
                          </InputGroup>
                        )}
                      />
                      {errors.phone && (
                        <Field.ErrorText fontSize="xs" color="red.500">
                          {errors.phone.message}
                        </Field.ErrorText>
                      )}
                    </Field.Root>

                    {/* Password */}
                    <Field.Root invalid={!!errors.password}>
                      <Field.Label fontSize="sm" color="gray.700">
                        Password
                      </Field.Label>
                      <Controller
                        name="password"
                        control={control}
                        rules={{
                          required: 'Password is required',
                          minLength: {
                            value: 8,
                            message: 'Password must be at least 8 characters',
                          },
                          pattern: {
                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/,
                            message: 'Must include uppercase, lowercase, and number',
                          },
                        }}
                        render={({ field }) => (
                          <InputGroup size="lg" 
                          endElement={
                          <HStack spacing={1}>
                                <IconButton
                                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                                  onClick={() => setShowPassword(!showPassword)}
                                  size="sm"
                                  variant="ghost"
                                >
                                    {showPassword ? <FiEyeOff color="gray.600" /> : <FiEye color="gray.600" />}
                                </IconButton>
                                <FiLock color={errors.password ? "#E53E3E" : "gray.400"} />
                              </HStack>}>
                            <Input
                              {...field}
                              type={showPassword ? 'text' : 'password'}
                              placeholder="••••••••"
                              autoComplete="new-password"
                            />
                          </InputGroup>
                        )}
                      />
                      {errors.password && (
                        <Field.ErrorText fontSize="xs" color="red.500">
                          {errors.password.message}
                        </Field.ErrorText>
                      )}
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        Must be at least 8 characters with uppercase, lowercase, and a number
                      </Text>
                    </Field.Root>

                    {/* Confirm Password */}
                    <Field.Root invalid={!!errors.confirmPassword}>
                      <Field.Label fontSize="sm" color="gray.700">
                        Confirm Password
                      </Field.Label>
                      <Controller
                        name="confirmPassword"
                        control={control}
                        rules={{
                          required: 'Please confirm your password',
                          validate: validatePasswordMatch,
                        }}
                        render={({ field }) => (
                          <InputGroup size="lg"
                            endElement={
                                <HStack spacing={1}>
                                    <IconButton
                                        variant="ghost"
                                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        size="sm"
                                    >
                                        {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                                    </IconButton>
                                    <FiLock color={errors.confirmPassword ? "#E53E3E" : "gray.400"} />
                                </HStack>
                                }
                            >
                            <Input
                              {...field}
                              type={showConfirmPassword ? 'text' : 'password'}
                              placeholder="••••••••"
                              autoComplete="new-password"
                            />
                            
                          </InputGroup>
                        )}
                      />
                      {errors.confirmPassword && (
                        <Field.ErrorText fontSize="xs" color="red.500">
                          {errors.confirmPassword.message}
                        </Field.ErrorText>
                      )}
                    </Field.Root>

                    {/* Next Button */}
                    <Button
                      type="button"
                      colorScheme="blue"
                      size="lg"
                      width="100%"
                      onClick={async () => {
                        // Validate all fields
                        const isValid = await trigger(['fullName', 'email', 'phone', 'password', 'confirmPassword'])
                        
                        if (isValid) {
                          // Check if verification was sent
                          if (!isVerificationSent) {
                            toaster.create({
                              title: 'Verify Your Email',
                              description: 'Please verify your email before proceeding',
                              type: 'warning',
                              duration: 3000,
                            })
                          } else {
                            setCurrentStep(2)
                          }
                        }
                      }}
                      rightIcon={<FiArrowLeft transform="rotate(180deg)" />}
                    >
                      Continue to Verification
                    </Button>
                  </>
                )}

                {/* Step 2: Verification */}
                {currentStep === 2 && (
                  <>
                    {/* Verification Info Alert */}
                    <Alert.Root status="info" variant="subtle" borderRadius="md">
                      <Alert.Indicator />
                      <Box>
                        <Alert.Title>Verify Your Email</Alert.Title>
                        <Alert.Description fontSize="sm">
                          We have sent a 6-digit verification code to {watch('email')}. 
                          Enter it below to complete your registration.
                        </Alert.Description>
                      </Box>
                    </Alert.Root>

                    {/* Verification Code */}
                    <Field.Root invalid={!!errors.verificationCode}>
                      <Field.Label fontSize="sm" color="gray.700">
                        Verification Code
                      </Field.Label>
                      <Controller
                        name="verificationCode"
                        control={control}
                        rules={{
                          required: 'Verification code is required',
                          pattern: {
                            value: /^\d{6}$/,
                            message: 'Code must be 6 digits',
                          },
                        }}
                        render={({ field }) => (
                          <InputGroup size="lg" endElement={<FiCheckCircle color={errors.verificationCode ? "#E53E3E" : "gray.400"} />}>
                            <Input
                              {...field}
                              type="text"
                              placeholder="123456"
                              maxLength={6}
                              inputMode="numeric"
                              pattern="[0-9]*"
                            />
                          </InputGroup>
                        )}
                      />
                      {errors.verificationCode && (
                        <Field.ErrorText fontSize="xs" color="red.500">
                          {errors.verificationCode.message}
                        </Field.ErrorText>
                      )}
                    </Field.Root>

                    {/* Timer and Resend */}
                    <HStack justify="space-between" width="100%">
                      <HStack spacing={2}>
                        <FiClock color={verificationTimer > 0 ? "#D69E2E" : "#718096"} />
                        <Text fontSize="sm" color={verificationTimer > 0 ? "orange.600" : "gray.600"}>
                          {verificationTimer > 0 
                            ? `Resend available in ${formatTime(verificationTimer)}`
                            : 'Code expired. Resend available'
                          }
                        </Text>
                      </HStack>
                      
                      <Button
                        variant="link"
                        size="sm"
                        colorScheme="blue"
                        onClick={handleResendVerification}
                        loading={isResendLoading}
                        loadingText="Sending..."
                        isDisabled={verificationTimer > 0}
                      >
                        Resend Code
                      </Button>
                    </HStack>

                    {/* Back Button */}
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      width="100%"
                      onClick={() => setCurrentStep(1)}
                      leftIcon={<FiArrowLeft />}
                    >
                      Back to Details
                    </Button>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      colorScheme="blue"
                      size="lg"
                      width="100%"
                      isLoading={isSubmitting}
                      loadingText="Creating Account..."
                      spinner={<Spinner size="sm" />}
                    >
                      Create Account
                    </Button>
                  </>
                )}
              </VStack>
            </form>

            {/* Terms and Conditions */}
            <Text fontSize="xs" color="gray.500" textAlign="center">
              By creating an account, you agree to our{' '}
              <Link href="/terms" color="blue.500" fontWeight="medium">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" color="blue.500" fontWeight="medium">
                Privacy Policy
              </Link>
            </Text>

            {/* Sign In Link */}
            <HStack spacing={1} justify="center">
              <Text fontSize="sm" color="gray.600">
                Already have an account?
              </Text>
              <Link
                href="/signin"
                fontSize="sm"
                color="blue.500"
                fontWeight="semibold"
              >
                Sign In
              </Link>
            </HStack>

          </VStack>
        </Card.Root>

        {/* Footer */}
        <HStack spacing={4} justify="center" mt={8}>
          {['Support', 'Privacy', 'Terms', 'Contact'].map((item) => (
            <Link
              key={item}
              href={`/${item.toLowerCase()}`}
              fontSize="sm"
              color="gray.500"
              _hover={{ color: 'blue.500' }}
            >
              {item}
            </Link>
          ))}
        </HStack>
      </Container>
    </Flex>
  )
}