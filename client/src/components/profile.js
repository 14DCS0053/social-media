import React, { Component } from 'react';
import { Button, Checkbox, Form } from 'semantic-ui-react'


class Profile extends Component {
    render() {
        return (<div style={{ width: '30%', margin: '40px auto' }}>
            <Form>
                <Form.Field>
                    <label>First Name</label>
                    <input placeholder='First Name' />
                </Form.Field>
                <Form.Field>
                    <label>Last Name</label>
                    <input placeholder='Last Name' />
                </Form.Field>
                <Form.Field>
                    <Checkbox label='I agree to the Terms and Conditions' />
                </Form.Field>
                <Button type='submit'>Update</Button>
            </Form>
        </div>)
    }
}
export default Profile;