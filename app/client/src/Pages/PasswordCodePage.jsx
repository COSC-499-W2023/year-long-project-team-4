import React from 'react'
import { Container,Form,InputGroup,Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { resetPasswordPath } from '../Path'
const PasswordCodePage = () => {
  const navigate = useNavigate();
  const handleSubmit = () => {
    navigate(resetPasswordPath);
  }
  return (
    <Container className="position-absolute top-50 start-50 translate-middle text-white text-center">
        <Form onSubmit={handleSubmit} className="text-center">
            <div className="text-white display-4"> Enter Emailed passcode</div>
            <InputGroup size="lg" className="mt-4">
                <InputGroup.Text id="inputGroup-sizing-lg">Passcode</InputGroup.Text>
                <Form.Control
                    aria-label="Large"
                    aria-describedby="inputGroup-sizing-sm"
                    required
                />
            </InputGroup>
            <Button className="mt-4" type="submit">Enter</Button>
        </Form>
    </Container>
  )
}

export default PasswordCodePage