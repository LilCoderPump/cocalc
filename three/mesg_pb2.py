# Generated by the protocol buffer compiler.  DO NOT EDIT!

from google.protobuf import descriptor
from google.protobuf import message
from google.protobuf import reflection
from google.protobuf import descriptor_pb2
# @@protoc_insertion_point(imports)



DESCRIPTOR = descriptor.FileDescriptor(
  name='mesg.proto',
  package='mthyme',
  serialized_pb='\n\nmesg.proto\x12\x06mthyme\"3\n\x0b\x45xecuteCode\x12\x0c\n\x04\x63ode\x18\x01 \x02(\t\x12\x16\n\x08preparse\x18\x02 \x01(\x08:\x04true\"a\n\x0cStartSession\x12\x14\n\x0cmax_walltime\x18\x01 \x01(\x05\x12\x13\n\x0bmax_cputime\x18\x02 \x01(\x05\x12\x14\n\x0cmax_numfiles\x18\x03 \x01(\x05\x12\x10\n\x08max_vmem\x18\x04 \x01(\x05\"\x12\n\x10TerminateSession\"!\n\x12SessionDescription\x12\x0b\n\x03pid\x18\x01 \x02(\x05\")\n\nSendSignal\x12\x0b\n\x03pid\x18\x01 \x02(\x05\x12\x0e\n\x06signal\x18\x02 \x02(\x05\"=\n\x06Output\x12\x0e\n\x06stdout\x18\x01 \x01(\t\x12\x0e\n\x06stderr\x18\x02 \x01(\t\x12\x13\n\x04\x64one\x18\x03 \x01(\x08:\x05\x66\x61lse\"\xbe\x03\n\x07Message\x12\"\n\x04type\x18\x01 \x02(\x0e\x32\x14.mthyme.Message.Type\x12\n\n\x02id\x18\x02 \x01(\r\x12)\n\x0c\x65xecute_code\x18\x03 \x01(\x0b\x32\x13.mthyme.ExecuteCode\x12+\n\rstart_session\x18\x04 \x01(\x0b\x32\x14.mthyme.StartSession\x12/\n\x11terminate_session\x18\x05 \x01(\x0b\x32\x14.mthyme.StartSession\x12\x37\n\x13session_description\x18\x06 \x01(\x0b\x32\x1a.mthyme.SessionDescription\x12\'\n\x0bsend_signal\x18\x07 \x01(\x0b\x32\x12.mthyme.SendSignal\x12\x1e\n\x06output\x18\x08 \x01(\x0b\x32\x0e.mthyme.Output\"x\n\x04Type\x12\x10\n\x0c\x45XECUTE_CODE\x10\x01\x12\x11\n\rSTART_SESSION\x10\x02\x12\x15\n\x11TERMINATE_SESSION\x10\x03\x12\x17\n\x13SESSION_DESCRIPTION\x10\x04\x12\x0f\n\x0bSEND_SIGNAL\x10\x05\x12\n\n\x06OUTPUT\x10\x06')



_MESSAGE_TYPE = descriptor.EnumDescriptor(
  name='Type',
  full_name='mthyme.Message.Type',
  filename=None,
  file=DESCRIPTOR,
  values=[
    descriptor.EnumValueDescriptor(
      name='EXECUTE_CODE', index=0, number=1,
      options=None,
      type=None),
    descriptor.EnumValueDescriptor(
      name='START_SESSION', index=1, number=2,
      options=None,
      type=None),
    descriptor.EnumValueDescriptor(
      name='TERMINATE_SESSION', index=2, number=3,
      options=None,
      type=None),
    descriptor.EnumValueDescriptor(
      name='SESSION_DESCRIPTION', index=3, number=4,
      options=None,
      type=None),
    descriptor.EnumValueDescriptor(
      name='SEND_SIGNAL', index=4, number=5,
      options=None,
      type=None),
    descriptor.EnumValueDescriptor(
      name='OUTPUT', index=5, number=6,
      options=None,
      type=None),
  ],
  containing_type=None,
  options=None,
  serialized_start=662,
  serialized_end=782,
)


_EXECUTECODE = descriptor.Descriptor(
  name='ExecuteCode',
  full_name='mthyme.ExecuteCode',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  fields=[
    descriptor.FieldDescriptor(
      name='code', full_name='mthyme.ExecuteCode.code', index=0,
      number=1, type=9, cpp_type=9, label=2,
      has_default_value=False, default_value=unicode("", "utf-8"),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    descriptor.FieldDescriptor(
      name='preparse', full_name='mthyme.ExecuteCode.preparse', index=1,
      number=2, type=8, cpp_type=7, label=1,
      has_default_value=True, default_value=True,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
  ],
  extensions=[
  ],
  nested_types=[],
  enum_types=[
  ],
  options=None,
  is_extendable=False,
  extension_ranges=[],
  serialized_start=22,
  serialized_end=73,
)


_STARTSESSION = descriptor.Descriptor(
  name='StartSession',
  full_name='mthyme.StartSession',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  fields=[
    descriptor.FieldDescriptor(
      name='max_walltime', full_name='mthyme.StartSession.max_walltime', index=0,
      number=1, type=5, cpp_type=1, label=1,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    descriptor.FieldDescriptor(
      name='max_cputime', full_name='mthyme.StartSession.max_cputime', index=1,
      number=2, type=5, cpp_type=1, label=1,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    descriptor.FieldDescriptor(
      name='max_numfiles', full_name='mthyme.StartSession.max_numfiles', index=2,
      number=3, type=5, cpp_type=1, label=1,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    descriptor.FieldDescriptor(
      name='max_vmem', full_name='mthyme.StartSession.max_vmem', index=3,
      number=4, type=5, cpp_type=1, label=1,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
  ],
  extensions=[
  ],
  nested_types=[],
  enum_types=[
  ],
  options=None,
  is_extendable=False,
  extension_ranges=[],
  serialized_start=75,
  serialized_end=172,
)


_TERMINATESESSION = descriptor.Descriptor(
  name='TerminateSession',
  full_name='mthyme.TerminateSession',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  fields=[
  ],
  extensions=[
  ],
  nested_types=[],
  enum_types=[
  ],
  options=None,
  is_extendable=False,
  extension_ranges=[],
  serialized_start=174,
  serialized_end=192,
)


_SESSIONDESCRIPTION = descriptor.Descriptor(
  name='SessionDescription',
  full_name='mthyme.SessionDescription',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  fields=[
    descriptor.FieldDescriptor(
      name='pid', full_name='mthyme.SessionDescription.pid', index=0,
      number=1, type=5, cpp_type=1, label=2,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
  ],
  extensions=[
  ],
  nested_types=[],
  enum_types=[
  ],
  options=None,
  is_extendable=False,
  extension_ranges=[],
  serialized_start=194,
  serialized_end=227,
)


_SENDSIGNAL = descriptor.Descriptor(
  name='SendSignal',
  full_name='mthyme.SendSignal',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  fields=[
    descriptor.FieldDescriptor(
      name='pid', full_name='mthyme.SendSignal.pid', index=0,
      number=1, type=5, cpp_type=1, label=2,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    descriptor.FieldDescriptor(
      name='signal', full_name='mthyme.SendSignal.signal', index=1,
      number=2, type=5, cpp_type=1, label=2,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
  ],
  extensions=[
  ],
  nested_types=[],
  enum_types=[
  ],
  options=None,
  is_extendable=False,
  extension_ranges=[],
  serialized_start=229,
  serialized_end=270,
)


_OUTPUT = descriptor.Descriptor(
  name='Output',
  full_name='mthyme.Output',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  fields=[
    descriptor.FieldDescriptor(
      name='stdout', full_name='mthyme.Output.stdout', index=0,
      number=1, type=9, cpp_type=9, label=1,
      has_default_value=False, default_value=unicode("", "utf-8"),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    descriptor.FieldDescriptor(
      name='stderr', full_name='mthyme.Output.stderr', index=1,
      number=2, type=9, cpp_type=9, label=1,
      has_default_value=False, default_value=unicode("", "utf-8"),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    descriptor.FieldDescriptor(
      name='done', full_name='mthyme.Output.done', index=2,
      number=3, type=8, cpp_type=7, label=1,
      has_default_value=True, default_value=False,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
  ],
  extensions=[
  ],
  nested_types=[],
  enum_types=[
  ],
  options=None,
  is_extendable=False,
  extension_ranges=[],
  serialized_start=272,
  serialized_end=333,
)


_MESSAGE = descriptor.Descriptor(
  name='Message',
  full_name='mthyme.Message',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  fields=[
    descriptor.FieldDescriptor(
      name='type', full_name='mthyme.Message.type', index=0,
      number=1, type=14, cpp_type=8, label=2,
      has_default_value=False, default_value=1,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    descriptor.FieldDescriptor(
      name='id', full_name='mthyme.Message.id', index=1,
      number=2, type=13, cpp_type=3, label=1,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    descriptor.FieldDescriptor(
      name='execute_code', full_name='mthyme.Message.execute_code', index=2,
      number=3, type=11, cpp_type=10, label=1,
      has_default_value=False, default_value=None,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    descriptor.FieldDescriptor(
      name='start_session', full_name='mthyme.Message.start_session', index=3,
      number=4, type=11, cpp_type=10, label=1,
      has_default_value=False, default_value=None,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    descriptor.FieldDescriptor(
      name='terminate_session', full_name='mthyme.Message.terminate_session', index=4,
      number=5, type=11, cpp_type=10, label=1,
      has_default_value=False, default_value=None,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    descriptor.FieldDescriptor(
      name='session_description', full_name='mthyme.Message.session_description', index=5,
      number=6, type=11, cpp_type=10, label=1,
      has_default_value=False, default_value=None,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    descriptor.FieldDescriptor(
      name='send_signal', full_name='mthyme.Message.send_signal', index=6,
      number=7, type=11, cpp_type=10, label=1,
      has_default_value=False, default_value=None,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    descriptor.FieldDescriptor(
      name='output', full_name='mthyme.Message.output', index=7,
      number=8, type=11, cpp_type=10, label=1,
      has_default_value=False, default_value=None,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
  ],
  extensions=[
  ],
  nested_types=[],
  enum_types=[
    _MESSAGE_TYPE,
  ],
  options=None,
  is_extendable=False,
  extension_ranges=[],
  serialized_start=336,
  serialized_end=782,
)

_MESSAGE.fields_by_name['type'].enum_type = _MESSAGE_TYPE
_MESSAGE.fields_by_name['execute_code'].message_type = _EXECUTECODE
_MESSAGE.fields_by_name['start_session'].message_type = _STARTSESSION
_MESSAGE.fields_by_name['terminate_session'].message_type = _STARTSESSION
_MESSAGE.fields_by_name['session_description'].message_type = _SESSIONDESCRIPTION
_MESSAGE.fields_by_name['send_signal'].message_type = _SENDSIGNAL
_MESSAGE.fields_by_name['output'].message_type = _OUTPUT
_MESSAGE_TYPE.containing_type = _MESSAGE;
DESCRIPTOR.message_types_by_name['ExecuteCode'] = _EXECUTECODE
DESCRIPTOR.message_types_by_name['StartSession'] = _STARTSESSION
DESCRIPTOR.message_types_by_name['TerminateSession'] = _TERMINATESESSION
DESCRIPTOR.message_types_by_name['SessionDescription'] = _SESSIONDESCRIPTION
DESCRIPTOR.message_types_by_name['SendSignal'] = _SENDSIGNAL
DESCRIPTOR.message_types_by_name['Output'] = _OUTPUT
DESCRIPTOR.message_types_by_name['Message'] = _MESSAGE

class ExecuteCode(message.Message):
  __metaclass__ = reflection.GeneratedProtocolMessageType
  DESCRIPTOR = _EXECUTECODE
  
  # @@protoc_insertion_point(class_scope:mthyme.ExecuteCode)

class StartSession(message.Message):
  __metaclass__ = reflection.GeneratedProtocolMessageType
  DESCRIPTOR = _STARTSESSION
  
  # @@protoc_insertion_point(class_scope:mthyme.StartSession)

class TerminateSession(message.Message):
  __metaclass__ = reflection.GeneratedProtocolMessageType
  DESCRIPTOR = _TERMINATESESSION
  
  # @@protoc_insertion_point(class_scope:mthyme.TerminateSession)

class SessionDescription(message.Message):
  __metaclass__ = reflection.GeneratedProtocolMessageType
  DESCRIPTOR = _SESSIONDESCRIPTION
  
  # @@protoc_insertion_point(class_scope:mthyme.SessionDescription)

class SendSignal(message.Message):
  __metaclass__ = reflection.GeneratedProtocolMessageType
  DESCRIPTOR = _SENDSIGNAL
  
  # @@protoc_insertion_point(class_scope:mthyme.SendSignal)

class Output(message.Message):
  __metaclass__ = reflection.GeneratedProtocolMessageType
  DESCRIPTOR = _OUTPUT
  
  # @@protoc_insertion_point(class_scope:mthyme.Output)

class Message(message.Message):
  __metaclass__ = reflection.GeneratedProtocolMessageType
  DESCRIPTOR = _MESSAGE
  
  # @@protoc_insertion_point(class_scope:mthyme.Message)

# @@protoc_insertion_point(module_scope)
