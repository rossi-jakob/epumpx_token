"use client";
import { io } from 'socket.io-client';

import Config from "@/app/config/config";

const Socket = new io(Config.API_URL)
export default Socket