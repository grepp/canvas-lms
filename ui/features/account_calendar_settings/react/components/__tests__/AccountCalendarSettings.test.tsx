/*
 * Copyright (C) 2022 - present Instructure, Inc.
 *
 * This file is part of Canvas.
 *
 * Canvas is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, version 3 of the License.
 *
 * Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License along
 * with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react'
import {render, act, waitFor} from '@testing-library/react'
import fetchMock from 'fetch-mock'

import {destroyContainer} from '@canvas/alerts/react/FlashAlert'

import {AccountCalendarSettings} from '../AccountCalendarSettings'
import {RESPONSE_ACCOUNT_1} from '../../__tests__/fixtures'

const defaultProps = {
  accountId: 1
}

beforeEach(() => {
  fetchMock.get(/\/api\/v1\/accounts\/1\/account_calendars.*/, RESPONSE_ACCOUNT_1)
})

afterEach(() => {
  fetchMock.restore()
  destroyContainer()
})

describe('AccountCalendarSettings', () => {
  it('renders header and subtext', () => {
    const {getByRole, getByText} = render(<AccountCalendarSettings {...defaultProps} />)
    expect(
      getByRole('heading', {name: 'Account Calendar Visibility', level: 1})
    ).toBeInTheDocument()
    expect(
      getByText(
        'Choose which calendars are visible in the Other Calendar section in the Canvas Calendar. Sub-account calendars are visible to users if they are associated with the account. By default, all calendars are hidden.'
      )
    ).toBeInTheDocument()
  })

  it('saves changes when clicking apply', async () => {
    fetchMock.put(/\/api\/v1\/accounts\/1\/account_calendars/, {message: 'Updated 1 account'})
    const {findByRole, getByRole, getByText, findAllByText} = render(
      <AccountCalendarSettings {...defaultProps} />
    )
    expect(await findByRole('button', {name: 'University (24)'})).toBeInTheDocument()
    const universityCheckbox = getByRole('checkbox', {name: 'Show account calendar for University'})
    const applyButton = getByRole('button', {name: 'Apply Changes'})
    expect(applyButton).toBeDisabled()
    act(() => universityCheckbox.click())
    expect(applyButton).toBeEnabled()
    act(() => applyButton.click())
    await waitFor(() => expect(getByText('Loading accounts')).toBeInTheDocument())
    expect((await findAllByText('Updated 1 account'))[0]).toBeInTheDocument()
  })
})
