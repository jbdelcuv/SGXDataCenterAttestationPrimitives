/*
 * Copyright (C) 2011-2021 Intel Corporation. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 *   * Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 *   * Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in
 *     the documentation and/or other materials provided with the
 *     distribution.
 *   * Neither the name of Intel Corporation nor the names of its
 *     contributors may be used to endorse or promote products derived
 *     from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */

import { crlService } from '../services/index.js';
import PccsStatus from '../constants/pccs_status_code.js';
import PccsError from '../utils/PccsError.js';
import logger from '../utils/Logger.js';

export async function getCrl(req, res, next) {
  const MAX_URL_LENGTH = 2048;

  try {
    // validate request parameters
    let uri = req.query.uri;
    if (!uri || uri.length > MAX_URL_LENGTH) {
      logger.error("uri is not valid : " + uri);
      throw new PccsError(PccsStatus.PCCS_STATUS_INVALID_REQ);
    }

    // validate uri
    let found_root = uri.match(/https:\/\/([a-zA-Z0-9-]*certificates\.trustedservices\.intel\.com|certprx\.adsdcsp\.com)\/IntelSGXRootCA\..*/);
    let found_intermediate = uri.match(/https:\/\/([a-zA-Z0-9-]*\.?api\.trustedservices\.intel\.com|[a-zA-Z0-9-]+\.az\.sgx(prod|np)\.adsdcsp\.com)\/sgx\/certification\/v([1-9][0-9]*)\/pckcrl\?.*/);
    if (!found_root && !found_intermediate) {
      logger.error("uri is not valid : " + uri);
      throw new PccsError(PccsStatus.PCCS_STATUS_INVALID_REQ);
    }

    // call service
    let crl = await crlService.getCrl(uri);

    // send response
    res
      .status(PccsStatus.PCCS_STATUS_SUCCESS[0])
      .header('Content-Type', 'application/pkix-crl')
      .send(crl);
  } catch (err) {
    next(err);
  }
}
