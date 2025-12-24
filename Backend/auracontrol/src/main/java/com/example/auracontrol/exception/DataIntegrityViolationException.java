package com.example.auracontrol.exception;

public class DataIntegrityViolationException  extends  RuntimeException{
    public DataIntegrityViolationException(String message){
        super(message);
    }
}
